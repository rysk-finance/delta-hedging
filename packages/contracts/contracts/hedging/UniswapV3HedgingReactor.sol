// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "../PriceFeed.sol";

import "../libraries/AccessControl.sol";
import "../libraries/OptionsCompute.sol";
import "../libraries/SafeTransferLib.sol";

import "../interfaces/IHedgingReactor.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

/**
 *   @title A hedging reactor that will manage delta by swapping between ETH and stablecoin spot assets on uniswap v3.
 *   @dev interacts with LiquidityPool via hedgeDelta, getDelta, getPoolDenominatedValue and withdraw,
 *        interacts with Uniswap V3 and chainlink via the swap functions
 */

contract UniswapV3HedgingReactor is IHedgingReactor, AccessControl {
	///////////////////////////
	/// immutable variables ///
	///////////////////////////

	/// @notice address of the parent liquidity pool contract
	address public immutable parentLiquidityPool;
	/// @notice address of the price feed used for getting asset prices
	address public immutable priceFeed;
	/// @notice generalised list of stablecoin addresses to trade against wETH
	address public immutable collateralAsset;
	/// @notice address of the wETH contract
	address public immutable wETH;
	/// @notice instance of the uniswap V3 router interface
	ISwapRouter public immutable swapRouter;

	/////////////////////////
	/// dynamic variables ///
	/////////////////////////

	/// @notice delta exposure of this reactor
	int256 public internalDelta;

	/////////////////////////////////////
	/// governance settable variables ///
	/////////////////////////////////////

	/// @notice limit to ensure we arent doing inefficient computation for dust amounts
	uint256 public minAmount = 1e16;
	/// @notice uniswap v3 pool fee expressed at 10e6
	uint24 public poolFee;
	/// @notice slippage for buys
	uint16 public buySlippage = 100;
	/// @notice slippage for sells
	uint16 public sellSlippage = 100;

	//////////////////////////
	/// constant variables ///
	//////////////////////////

	/// @notice used for unlimited token approval
	uint256 private constant MAX_UINT = 2**256 - 1;

	constructor(
		ISwapRouter _swapRouter,
		address _collateralAsset,
		address _wethAddress,
		address _parentLiquidityPool,
		uint24 _poolFee,
		address _priceFeed,
		address _authority
	) AccessControl(IAuthority(_authority)) {
		swapRouter = _swapRouter;
		collateralAsset = _collateralAsset;
		wETH = _wethAddress;
		parentLiquidityPool = _parentLiquidityPool;
		poolFee = _poolFee;
		priceFeed = _priceFeed;

		SafeTransferLib.safeApprove(ERC20(collateralAsset), address(swapRouter), MAX_UINT);
		SafeTransferLib.safeApprove(ERC20(_wethAddress), address(swapRouter), MAX_UINT);
	}

	///////////////
	/// setters ///
	///////////////

	/// @notice update the uniswap v3 pool fee
	function changePoolFee(uint24 _poolFee) external {
		_onlyGovernor();
		poolFee = _poolFee;
	}

	/// @notice update the minAmount parameter
	function setMinAmount(uint256 _minAmount) external {
		_onlyGovernor();
		minAmount = _minAmount;
	}

	/// @notice set slippage
	function setSlippage(uint16 _buySlippage, uint16 _sellSlippage) external {
		_onlyGovernor();
		require(_sellSlippage < 10000);
		buySlippage = _buySlippage;
		sellSlippage = _sellSlippage;
	}

	//////////////////////////////////////////////////////
	/// access-controlled state changing functionality ///
	//////////////////////////////////////////////////////

	/// @inheritdoc IHedgingReactor
	function hedgeDelta(int256 _delta) external returns (int256) {
		address parentLiquidityPool_ = parentLiquidityPool;
		address wETH_ = wETH;
		require(msg.sender == parentLiquidityPool_, "!vault");
		// cache
		address collateralAsset_ = collateralAsset;
		int256 deltaChange;
		uint256 underlyingPrice = getUnderlyingPrice(wETH_, collateralAsset_);
		if (_delta < 0) {
			// buy wETH
			// get the current price convert it to collateral decimals multiply it by the amount, add 1% then make sure decimals are fine
			uint256 amountInMaximum = (OptionsCompute.convertToDecimals(
				underlyingPrice,
				ERC20(collateralAsset_).decimals()
			) *
				uint256(-_delta) *
				(10000 + buySlippage)) / 1e22;
			(deltaChange, ) = _swapExactOutputSingle(uint256(-_delta), amountInMaximum, collateralAsset_);
			internalDelta += deltaChange;
			SafeTransferLib.safeTransfer(
				ERC20(collateralAsset_),
				parentLiquidityPool_,
				ERC20(collateralAsset_).balanceOf(address(this))
			);
			return deltaChange;
		} else {
			// sell wETH
			uint256 ethBalance = ERC20(wETH_).balanceOf(address(this));
			if (ethBalance < minAmount) {
				return 0;
			}
			if (_delta > int256(ethBalance)) {
				// not enough ETH to sell to offset delta so sell all ETH available.
				// get the current price convert it to collateral decimals multiply it by the amount, take away 1% then make sure the decimals are fine
				uint256 amountOutMinimum = (OptionsCompute.convertToDecimals(
					underlyingPrice,
					ERC20(collateralAsset_).decimals()
				) * ethBalance * (10000 - sellSlippage)) / 1e22;
				(deltaChange, ) = _swapExactInputSingle(ethBalance, amountOutMinimum, collateralAsset_);
				internalDelta += deltaChange;
			} else {
				// get the current price convert it to collateral decimals multiply it by the amount, take away 1% then make sure the decimals are fine
				uint256 amountOutMinimum = (OptionsCompute.convertToDecimals(
					underlyingPrice,
					ERC20(collateralAsset_).decimals()
				) * uint256(_delta) * (10000 - sellSlippage)) / 1e22;
				(deltaChange, ) = _swapExactInputSingle(uint256(_delta), amountOutMinimum, collateralAsset_);
				internalDelta += deltaChange;
			}
			SafeTransferLib.safeTransfer(
				ERC20(collateralAsset_),
				parentLiquidityPool_,
				ERC20(collateralAsset_).balanceOf(address(this))
			);
			return deltaChange;
		}
	}

	/// @inheritdoc IHedgingReactor
	function withdraw(uint256 _amount) external returns (uint256) {
		require(msg.sender == parentLiquidityPool, "!vault");
		address _token = collateralAsset;
		// check the holdings if enough just lying around then transfer it
		uint256 balance = ERC20(_token).balanceOf(address(this));
		if (balance == 0) {
			return 0;
		}
		if (_amount <= balance) {
			SafeTransferLib.safeTransfer(ERC20(_token), msg.sender, _amount);
			// return in collat decimals format
			return _amount;
		} else {
			SafeTransferLib.safeTransfer(ERC20(_token), msg.sender, balance);
			// return in collatDecimals format
			return balance;
		}
	}

	/////////////////////////////////////////////
	/// external state changing functionality ///
	/////////////////////////////////////////////

	/// @inheritdoc IHedgingReactor
	function update() external pure returns (uint256) {
		return 0;
	}

	///////////////////////
	/// complex getters ///
	///////////////////////

	/// @inheritdoc IHedgingReactor
	function getDelta() external view returns (int256 delta) {
		return internalDelta;
	}

	/// @inheritdoc IHedgingReactor
	function getPoolDenominatedValue() external view returns (uint256 value) {
		address collateralAsset_ = collateralAsset;
		address wETH_ = wETH;
		return
			OptionsCompute.convertFromDecimals(
				ERC20(collateralAsset_).balanceOf(address(this)),
				ERC20(collateralAsset_).decimals()
			) +
			(PriceFeed(priceFeed).getNormalizedRate(wETH_, collateralAsset_) *
				ERC20(wETH_).balanceOf(address(this))) /
			10**ERC20(wETH_).decimals();
	}

	//////////////////////////
	/// internal utilities ///
	//////////////////////////

	/** @notice function to sell stablecoins for exact amount of wETH to increase delta
	 *  @param _amountOut the exact amount of wETH to buy
	 *  @param _amountInMaximum the max amount of stablecoin willing to spend. Slippage limit.
	 *  @param _sellToken the stablecoin to sell
	 */
	function _swapExactOutputSingle(
		uint256 _amountOut,
		uint256 _amountInMaximum,
		address _sellToken
	) internal returns (int256, uint256) {
		SafeTransferLib.safeTransferFrom(_sellToken, msg.sender, address(this), _amountInMaximum);

		ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
			tokenIn: _sellToken,
			tokenOut: wETH,
			fee: poolFee,
			recipient: address(this),
			deadline: block.timestamp,
			amountOut: _amountOut,
			amountInMaximum: _amountInMaximum,
			sqrtPriceLimitX96: 0
		});

		// Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
		uint256 amountIn = swapRouter.exactOutputSingle(params);
		return (int256(_amountOut), amountIn);
	}

	/** @notice function to sell exact amount of wETH to decrease delta
	 *  @param _amountIn the exact amount of wETH to sell
	 *  @param _amountOutMinimum the min amount of stablecoin willing to receive. Slippage limit.
	 *  @param _buyToken the stablecoin to buy
	 *  @return deltaChange The resulting difference in delta exposure
	 */
	function _swapExactInputSingle(
		uint256 _amountIn,
		uint256 _amountOutMinimum,
		address _buyToken
	) internal returns (int256, uint256) {
		ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
			tokenIn: wETH,
			tokenOut: _buyToken,
			fee: poolFee,
			recipient: address(this),
			deadline: block.timestamp,
			amountIn: _amountIn,
			amountOutMinimum: _amountOutMinimum,
			sqrtPriceLimitX96: 0
		});

		// The call to `exactInputSingle` executes the swap.
		uint256 amountOut = swapRouter.exactInputSingle(params);
		// return negative _amountIn because deltaChange is negative
		return (-int256(_amountIn), amountOut);
	}

	/**
	 * @notice get the underlying price with just the underlying asset and strike asset
	 * @param underlying   the asset that is used as the reference asset
	 * @param _strikeAsset the asset that the underlying value is denominated in
	 * @return the underlying price
	 */
	function getUnderlyingPrice(address underlying, address _strikeAsset)
		internal
		view
		returns (uint256)
	{
		return PriceFeed(priceFeed).getNormalizedRate(underlying, _strikeAsset);
	}
}
