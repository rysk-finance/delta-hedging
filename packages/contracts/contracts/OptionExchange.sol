// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Protocol.sol";
import "./PriceFeed.sol";
import "./BeyondPricer.sol";

import "./tokens/ERC20.sol";
import "./libraries/Types.sol";
import "./utils/ReentrancyGuard.sol";
import "./libraries/CustomErrors.sol";
import "./libraries/AccessControl.sol";
import "./libraries/OptionsCompute.sol";
import "./libraries/SafeTransferLib.sol";
import "./libraries/OpynInteractions.sol";

import "./interfaces/IWhitelist.sol";
import "./interfaces/IHedgingReactor.sol";
import "./interfaces/AddressBookInterface.sol";
import "./interfaces/ILiquidityPool.sol";
import "./interfaces/IOptionRegistry.sol";
import "./interfaces/IAlphaPortfolioValuesFeed.sol";
import "./libraries/RyskActions.sol";
import "./libraries/CombinedActions.sol";

import "prb-math/contracts/PRBMathSD59x18.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

import "@openzeppelin/contracts/security/Pausable.sol";
import { IOtoken, IController } from "./interfaces/GammaInterface.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "hardhat/console.sol";

/**
 *  @title Contract used for all user facing options interactions
 *  @dev Interacts with liquidityPool to write options and quote their prices.
 */
contract OptionExchange is Pausable, AccessControl, ReentrancyGuard, IHedgingReactor {
	using PRBMathSD59x18 for int256;
	using PRBMathUD60x18 for uint256;

	///////////////////////////
	/// immutable variables ///
	///////////////////////////

	// Liquidity pool contract
	ILiquidityPool public immutable liquidityPool;
	// protocol management contract
	Protocol public immutable protocol;
	// asset that denominates the strike price
	address public immutable strikeAsset;
	// asset that is used as the reference asset
	address public immutable underlyingAsset;
	// asset that is used for collateral asset
	address public immutable collateralAsset;
	/// @notice address book used for the gamma protocol
	AddressBookInterface public immutable addressbook;
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

	// pricer contract used for pricing options
	BeyondPricer public pricer;
	// option configurations approved for sale, stored by hash of expiration timestamp, strike (in e18) and isPut bool
	mapping(bytes32 => bool) public approvedOptions;
	/// @notice spot hedging reactor
	address public spotHedgingReactor;
	// whether the dhv is buying this option stored by hash
	mapping(bytes32 => bool) public isBuyable;
	// whether the dhv is selling this option stored by hash
	mapping(bytes32 => bool) public isSellable;
	// array of expirations currently supported (mainly for frontend use)
	uint64[] public expirations;
	// details of supported options first key is expiration then isPut then an array of strikes (mainly for frontend use)
	mapping(uint256 => mapping(bool => uint128[])) public optionDetails;
	/// @notice pool fees for different swappable assets
	mapping(address => uint24) public poolFees;
	/// @notice when redeeming other asset, send to a reactor or sell it
	bool public sellRedemptions = true;

	// user -> series addresses interacted with in this transaction
	mapping(address => address[]) internal tempSeriesQueue;
	// user -> seriesAddress -> amount
	mapping(address => mapping(address => uint256)) public heldOtokens;

	//////////////////////////
	/// constant variables ///
	//////////////////////////

	/// @notice max bips used for percentages
	uint256 private constant MAX_BIPS = 10_000;
	// oToken decimals
	uint8 private constant OPYN_DECIMALS = 8;
	// scale otoken conversion decimals
	uint8 private constant CONVERSION_DECIMALS = 18 - OPYN_DECIMALS;
	/// @notice used for unlimited token approval
	uint256 private constant MAX_UINT = 2**256 - 1;

	/////////////////////////
	/// structs && events ///
	/////////////////////////

	event SeriesApproved(
		uint64 expiration,
		uint128 strike,
		bool isPut,
		bool isBuyable,
		bool isSellable
	);
	event SeriesDisabled(uint64 expiration, uint128 strike, bool isPut);
	event SeriesAltered(
		uint64 expiration,
		uint128 strike,
		bool isPut,
		bool isBuyable,
		bool isSellable
	);
	event OptionsBought();
	event OptionPositionsClosed();
	event OptionsRedeemed(
		address series,
		uint256 optionAmount,
		uint256 redeemAmount,
		address redeemAsset
	);
	event RedemptionSent(uint256 redeemAmount, address redeemAsset, address recipient);

	error PoolFeeNotSet();
	error ForbiddenAction();
	error OtokenImbalance();
	error UnauthorisedSender();
	error OperatorNotApproved();

	constructor(
		address _authority,
		address _protocol,
		address _liquidityPool,
		address _pricer,
		address _addressbook,
		address _swapRouter
	) AccessControl(IAuthority(_authority)) {
		protocol = Protocol(_protocol);
		liquidityPool = ILiquidityPool(_liquidityPool);
		collateralAsset = liquidityPool.collateralAsset();
		underlyingAsset = liquidityPool.underlyingAsset();
		strikeAsset = liquidityPool.strikeAsset();
		addressbook = AddressBookInterface(_addressbook);
		swapRouter = ISwapRouter(_swapRouter);
		pricer = BeyondPricer(_pricer);
	}

	///////////////
	/// setters ///
	///////////////

	function pause() external {
		_onlyGuardian();
		_pause();
	}

	function unpause() external {
		_onlyGuardian();
		_unpause();
	}

	/**
	 * @notice change the pricer
	 */
	function setPricer(address _pricer) external {
		_onlyGovernor();
		pricer = BeyondPricer(_pricer);
	}

	/// @notice set the uniswap v3 pool fee for a given asset, also give the asset max approval on the uni v3 swap router
	function setPoolFee(address asset, uint24 fee) external {
		_onlyGovernor();
		poolFees[asset] = fee;
		SafeTransferLib.safeApprove(ERC20(asset), address(swapRouter), MAX_UINT);
	}

	/// @notice whether when redeeming options if the proceeds are in eth they should be converted to usdc or sent to the spot hedging reactor
	///  		true for selling off to usdc and sending to the liquidity pool and false for sell
	function setSellRedemptions(bool _sellRedemptions, address _reactor) external {
		_onlyGovernor();
		sellRedemptions = _sellRedemptions;
		spotHedgingReactor = _reactor;
	}

	//////////////////////////////////////////////////////
	/// access-controlled state changing functionality ///
	//////////////////////////////////////////////////////

	/// @inheritdoc IHedgingReactor
	function hedgeDelta(int256 _delta) external returns (int256) {
		return 0;
	}

	/// @inheritdoc IHedgingReactor
	function withdraw(uint256 _amount) external returns (uint256) {
		require(msg.sender == address(liquidityPool), "!vault");
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

	/// @inheritdoc IHedgingReactor
	function update() external pure returns (uint256) {
		return 0;
	}

	/**
	 * @notice issue an option series for buying or sale
	 * @param  options option type to approve - strike in e18
	 * @dev    only callable by the manager
	 */
	function issueNewSeries(Types.Option[] memory options) external nonReentrant {
		_onlyManager();
		uint256 addressLength = options.length;
		for (uint256 i = 0; i < addressLength; i++) {
			Types.Option memory o = options[i];
			// make sure the strike gets formatted properly
			uint128 strike = uint128(
				formatStrikePrice(o.strike, collateralAsset) * 10**(CONVERSION_DECIMALS)
			);
			// get the hash of the option (how the option is stored on the books)
			bytes32 optionHash = keccak256(abi.encodePacked(o.expiration, strike, o.isPut));
			// if the option is already issued then skip it
			if (approvedOptions[optionHash]) {
				continue;
			}
			// store information on the series
			approvedOptions[optionHash] = true;
			isBuyable[optionHash] = o.isBuyable;
			isSellable[optionHash] = o.isSellable;
			// store it in an array, these are mainly for frontend/informational use
			// if the strike array is empty for calls and puts for that expiry it means that this expiry hasnt been issued yet
			// so we should save the expory
			if (
				optionDetails[o.expiration][true].length == 0 && optionDetails[o.expiration][false].length == 0
			) {
				expirations.push(o.expiration);
			}
			// we wouldnt get here if the strike already existed, so we store it in the array
			// there shouldnt be any duplicates in the strike array or expiration array
			optionDetails[o.expiration][o.isPut].push(strike);
			// emit an event of the series creation, now users can write options on this series
			emit SeriesApproved(o.expiration, strike, o.isPut, o.isBuyable, o.isSellable);
		}
	}

	/**
	 * @notice change whether an issued option is for buy or sale
	 * @param  options option type to change status on - strike in e18
	 * @dev    only callable by the manager
	 */
	function changeOptionBuyOrSell(Types.Option[] memory options) external nonReentrant {
		_onlyManager();
		uint256 adLength = options.length;
		for (uint256 i = 0; i < adLength; i++) {
			Types.Option memory o = options[i];
			// make sure the strike gets formatted properly, we get it to e8 format in the converter
			// then convert it back to e18
			uint128 strike = uint128(
				formatStrikePrice(o.strike, collateralAsset) * 10**(CONVERSION_DECIMALS)
			);
			// get the option hash
			bytes32 optionHash = keccak256(abi.encodePacked(o.expiration, strike, o.isPut));
			// if its already approved then we can change its parameters, if its not approved then revert as there is a mistake
			if (approvedOptions[optionHash]) {
				isBuyable[optionHash] = o.isBuyable;
				isSellable[optionHash] = o.isSellable;
				emit SeriesAltered(o.expiration, strike, o.isPut, o.isBuyable, o.isSellable);
			} else {
				revert CustomErrors.UnapprovedSeries();
			}
		}
	}

	/**
	 * @notice get the dhv to redeem an expired otoken
	 * @param _series the list of series to redeem
	 */
	function redeem(address[] memory _series) external {
		uint256 adLength = _series.length;
		for (uint256 i; i < adLength; i++) {
			// get the number of otokens held by this address for the specified series
			uint256 optionAmount = ERC20(_series[i]).balanceOf(address(this));
			IOtoken otoken = IOtoken(_series[i]);
			// redeem from opyn to this address
			uint256 redeemAmount = OpynInteractions.redeemToAddress(
				addressbook.getController(),
				addressbook.getMarginPool(),
				_series[i],
				optionAmount,
				address(this)
			);

			address otokenCollateralAsset = otoken.collateralAsset();
			emit OptionsRedeemed(_series[i], optionAmount, redeemAmount, otokenCollateralAsset);
			// if the collateral used by the otoken is the collateral asset then transfer the redemption to the liquidity pool
			// if the collateral used by the otoken is the underlying asset and sellRedemptions is false, then send the funds to the uniswapHedgingReactor
			// if the collateral used by the otoken is anything else (or if underlying and sellRedemptions is true) then swap it on uniswap and send the proceeds to the liquidity pool
			if (otokenCollateralAsset == collateralAsset) {
				SafeTransferLib.safeTransfer(ERC20(collateralAsset), address(liquidityPool), redeemAmount);
				emit RedemptionSent(redeemAmount, collateralAsset, address(liquidityPool));
			} else if (otokenCollateralAsset == underlyingAsset && !sellRedemptions) {
				SafeTransferLib.safeTransfer(ERC20(otokenCollateralAsset), spotHedgingReactor, redeemAmount);
				emit RedemptionSent(redeemAmount, otokenCollateralAsset, spotHedgingReactor);
			} else {
				uint256 redeemableCollateral = _swapExactInputSingle(redeemAmount, 0, otokenCollateralAsset);
				SafeTransferLib.safeTransfer(
					ERC20(collateralAsset),
					address(liquidityPool),
					redeemableCollateral
				);
				emit RedemptionSent(redeemableCollateral, collateralAsset, address(liquidityPool));
			}
		}
	}

	/////////////////////////////////////////////
	/// external state changing functionality ///
	/////////////////////////////////////////////

	/**
	 * @notice entry point to the contract for users, takes a queue of actions for both opyn and rysk and executes them sequentially
	 * @param  _operationProcedures an array of actions to be executed sequentially
	 */
	function operate(CombinedActions.OperationProcedures[] memory _operationProcedures)
		external
		nonReentrant
		whenNotPaused
	{
		_runActions(_operationProcedures);
		address[] memory interactedSeries = tempSeriesQueue[msg.sender];
		uint256 arr = interactedSeries.length;
		for (uint256 i=0; i < arr; i++ ) {
			if (heldOtokens[msg.sender][interactedSeries[i]] != 0) {
				revert OtokenImbalance();
			}
		}
		delete tempSeriesQueue[msg.sender];
	}

	function _runActions(CombinedActions.OperationProcedures[] memory _operationProcedures) internal {
		for (uint256 i = 0; i < _operationProcedures.length; i++) {
			CombinedActions.OperationProcedures memory operationProcedure = _operationProcedures[i];
			CombinedActions.OperationType operation = operationProcedure.operation;
			if (operation == CombinedActions.OperationType.OPYN) {
				_runOpynActions(operationProcedure.operationQueue);
			} else if (operation == CombinedActions.OperationType.RYSK) {
				_runRyskActions(operationProcedure.operationQueue);
			}
		}
	}

	function _runOpynActions(CombinedActions.ActionArgs[] memory _opynActions) internal {
		IController controller = IController(addressbook.getController());
		uint256 arr = _opynActions.length;
		IController.ActionArgs[] memory _opynArgs = new IController.ActionArgs[](arr);
		for (uint256 i = 0; i < arr; i++) {
			// loop through the opyn actions, if any involve opening a vault then make sure the msg.sender gets the ownership and if there are any more vault ids make sure the msg.sender is the owners
			IController.ActionArgs memory action = CombinedActions._parseOpynArgs(_opynActions[i]);
			IController.ActionType actionType = action.actionType;
			// make sure the owner parameter being sent in is the msg.sender this makes sure senders arent messing around with other vaults
			if (action.owner != msg.sender) {
				revert UnauthorisedSender();
			}
			// users need to have this contract approved as an operator so it can carry out actions on the user's behalf
			if (!controller.isOperator(msg.sender, address(this))){
				revert OperatorNotApproved();
			}
 		if (actionType == IController.ActionType.DepositLongOption) {
				// TODO: make work with negative heldOtokens
				require(action.secondAddress == msg.sender, "Unauthorised Sender");
				// check the from address to make sure it comes from the user or if we are holding them temporarily then they are held here
			} else if (actionType == IController.ActionType.WithdrawLongOption) {
				if (action.secondAddress == address(this)) {
					_updateTempHoldings(action);
				}
				// check the to address to see whether it is being sent to the user or held here temporarily
			} else if (actionType == IController.ActionType.DepositCollateral) {
				// check the from address is the msg.sender so the sender cant take collat from elsewhere
				require(action.secondAddress == msg.sender, "Unauthorised Sender");
			} else if (actionType == IController.ActionType.MintShortOption) {
				if (action.secondAddress == address(this)) {
					_updateTempHoldings(action);
				}
				// check the to address to see whether it is being sent to the user or held here temporarily
			} else if (actionType == IController.ActionType.BurnShortOption) {
				// TODO: make work with negative heldOtokens
				require(action.secondAddress == msg.sender, "Unauthorised Sender");
				// check the from address to see whether it is being sent from the user or is held from a temporary balance
			} else if (actionType == IController.ActionType.Redeem) {
				revert ForbiddenAction();
			} else if (actionType == IController.ActionType.Liquidate) {
				revert ForbiddenAction();
			} else if (actionType == IController.ActionType.Call) {
				revert ForbiddenAction();
			}
			_opynArgs[i] = action;
		}
		controller.operate(_opynArgs);
	}

	function _runRyskActions(CombinedActions.ActionArgs[] memory _ryskActions) internal {
		for (uint256 i = 0; i < _ryskActions.length; i++) {
			// loop through the rysk actions
			RyskActions.ActionArgs memory action = CombinedActions._parseRyskArgs(_ryskActions[i]);
			RyskActions.ActionType actionType = action.actionType;
			if (actionType == RyskActions.ActionType.Issue) {
				_issue(RyskActions._parseIssueArgs(action));
			} else if (actionType == RyskActions.ActionType.BuyOption) {
				_buyOption(RyskActions._parseBuyOptionArgs(action));
			} else if (actionType == RyskActions.ActionType.SellOption) {
				_sellOption(RyskActions._parseSellOptionArgs(action));
			}
		}
	}

	/**
	 * @notice issue an otoken that the dhv can now sell to buyers
	 * @param _args RyskAction struct containing details on the option to issue
	 * @return series the address of the option activated for selling by the dhv
	 */
	function _issue(RyskActions.IssueArgs memory _args)
		internal
		whenNotPaused
		returns (address series)
	{
		// format the strike correctly
		uint128 strike = uint128(
			formatStrikePrice(_args.optionSeries.strike, collateralAsset) * 10**CONVERSION_DECIMALS
		);
		// check if the option series is approved
		bytes32 oHash = keccak256(
			abi.encodePacked(_args.optionSeries.expiration, strike, _args.optionSeries.isPut)
		);
		if (!approvedOptions[oHash]) {
			revert CustomErrors.UnapprovedSeries();
		}
		// check if the series is buyable
		if (!isBuyable[oHash]) {
			revert CustomErrors.SeriesNotBuyable();
		}
		series = liquidityPool.handlerIssue(_args.optionSeries);
	}

	/**
	 * @notice function that allows a user to buy options from the dhv where they pay the dhv using the collateral asset
	 * @param _args RyskAction struct containing details on the option to buy
	 * @return the number of options bought by the user
	 */
	function _buyOption(RyskActions.BuyOptionArgs memory _args)
		internal
		whenNotPaused
		returns (uint256)
	{
		// get the option details in the correct formats
		IOptionRegistry optionRegistry = getOptionRegistry();
		(
			address seriesAddress,
			Types.OptionSeries memory optionSeries,
			uint128 strikeDecimalConverted
		) = _getOptionDetails(_args.seriesAddress, _args.optionSeries, optionRegistry);
		// check the option hash and option series for validity
		_checkHash(optionSeries, strikeDecimalConverted, false);
		// convert the strike to e18 decimals for storage, this gets the strike price in e18 decimals
		Types.OptionSeries memory seriesToStore = Types.OptionSeries(
			optionSeries.expiration,
			strikeDecimalConverted,
			optionSeries.isPut,
			underlyingAsset,
			strikeAsset,
			optionSeries.collateral
		);
		// calculate premium and delta from the option pricer, returning the premium in collateral decimals and delta in e18
		(uint256 premium, int256 delta) = pricer.quoteOptionPrice(seriesToStore, _args.amount, false);
		// transfer the premium from the user to the liquidity pool
		SafeTransferLib.safeTransferFrom(collateralAsset, msg.sender, address(liquidityPool), premium);
		// get what our long exposure is on this asset, as this can be used instead of the dhv having to lock up collateral
		int256 longExposure = getPortfolioValuesFeed().storesForAddress(seriesAddress).longExposure;
		uint256 amount = _args.amount;
		if (longExposure > 0) {
			// calculate the maximum amount that should be bought by the user
			uint256 boughtAmount = uint256(longExposure) > amount ? amount : uint256(longExposure);
			// transfer the otokens to the user
			SafeTransferLib.safeTransfer(
				ERC20(seriesAddress),
				_args.recipient,
				boughtAmount / (10**CONVERSION_DECIMALS)
			);
			// update the series on the stores
			getPortfolioValuesFeed().updateStores(seriesToStore, 0, -int256(boughtAmount), seriesAddress);
			amount -= boughtAmount;
			if (amount == 0) {
				return _args.amount;
			}
		}
		if (optionSeries.collateral != collateralAsset) {
			revert CustomErrors.CollateralAssetInvalid();
		}
		// add this series to the portfolio values feed so its stored on the book
		getPortfolioValuesFeed().updateStores(seriesToStore, int256(amount), 0, seriesAddress);
		// get the liquidity pool to write the options
		return
			liquidityPool.handlerWriteOption(
				optionSeries,
				seriesAddress,
				amount,
				optionRegistry,
				premium,
				delta,
				msg.sender
			);
	}

	/**
	 * @notice function that allows a user to sell options to the dhv and pays them a premium in the vaults collateral asset
	 * @param _args RyskAction struct containing details on the option to sell
	 */
	function _sellOption(RyskActions.SellOptionArgs memory _args) internal whenNotPaused {
		IOptionRegistry optionRegistry = getOptionRegistry();
		(
			address seriesAddress,
			Types.OptionSeries memory optionSeries,
			uint128 strikeDecimalConverted
		) = _getOptionDetails(_args.seriesAddress, _args.optionSeries, optionRegistry);
		// check the option hash and option series for validity
		_checkHash(optionSeries, strikeDecimalConverted, true);
		// convert the strike to e18 decimals for storage
		Types.OptionSeries memory seriesToStore = Types.OptionSeries(
			optionSeries.expiration,
			strikeDecimalConverted,
			optionSeries.isPut,
			underlyingAsset,
			strikeAsset,
			optionSeries.collateral
		);
		// get the unit price for premium and delta
		(uint256 premium, int256 delta) = pricer.quoteOptionPrice(seriesToStore, 1e18, true);
		uint256 amount = _args.amount;
		int256 shortExposure = getPortfolioValuesFeed().storesForAddress(seriesAddress).shortExposure;
		uint256 tempHoldings = heldOtokens[msg.sender][seriesAddress];
		heldOtokens[msg.sender][seriesAddress] -= min(tempHoldings, _args.amount);
		if (shortExposure > 0) {
			uint256 transferAmount = min(uint256(shortExposure), _args.amount);
			if (tempHoldings > 0) {
				ERC20(seriesAddress).approve(address(liquidityPool), min(tempHoldings, transferAmount));
			}
			if (transferAmount >= min(tempHoldings, transferAmount)) {
				SafeTransferLib.safeTransferFrom(
					seriesAddress,
					msg.sender,
					address(liquidityPool),
					OptionsCompute.convertToDecimals(transferAmount - min(tempHoldings, transferAmount), ERC20(seriesAddress).decimals())
				);
			}
			uint256 soldBackAmount = liquidityPool.handlerBuybackOption(
				optionSeries,
				transferAmount,
				optionRegistry,
				seriesAddress,
				premium.mul(transferAmount),
				delta.mul(int256(transferAmount)),
				msg.sender
			);
			// update the series on the stores
			getPortfolioValuesFeed().updateStores(seriesToStore, -int256(soldBackAmount), 0, seriesAddress);
			amount -= soldBackAmount;
			tempHoldings -= min(tempHoldings, transferAmount);
			if (amount == 0) {
				return;
			}
		}
		if (amount - tempHoldings > 0) {
			// transfer the otokens to this exchange
			SafeTransferLib.safeTransferFrom(
				seriesAddress,
				msg.sender,
				address(this),
				OptionsCompute.convertToDecimals(amount - tempHoldings, ERC20(seriesAddress).decimals())
			);
		}
		// take the funds from the liquidity pool and pay the user for the oTokens
		SafeTransferLib.safeTransferFrom(
			collateralAsset,
			address(liquidityPool),
			msg.sender,
			premium.mul(amount)
		);
		// update on the pvfeed stores
		getPortfolioValuesFeed().updateStores(seriesToStore, 0, int256(amount), seriesAddress);
	}

	///////////////////////////
	/// non-complex getters ///
	///////////////////////////

	/**
	 * @notice get the option registry used for storing and managing the options
	 * @return the option registry contract
	 */
	function getOptionRegistry() internal view returns (IOptionRegistry) {
		return IOptionRegistry(protocol.optionRegistry());
	}

	/**
	 * @notice get the portfolio values feed used by the liquidity pool
	 * @return the portfolio values feed contract
	 */
	function getPortfolioValuesFeed() internal view returns (IAlphaPortfolioValuesFeed) {
		return IAlphaPortfolioValuesFeed(protocol.portfolioValuesFeed());
	}

	/**
	 * @notice get list of all expirations ever activated
	 * @return list of expirations
	 */
	function getExpirations() external view returns (uint64[] memory) {
		return expirations;
	}

	/**
	 * @notice get list of all strikes for a specific expiration and flavour
	 * @return list of strikes for a specific expiry and flavour
	 */
	function getOptionDetails(uint64 expiration, bool isPut) external view returns (uint128[] memory) {
		return optionDetails[expiration][isPut];
	}

	/// @inheritdoc IHedgingReactor
	function getDelta() external view returns (int256 delta) {
		return 0;
	}

	/// @inheritdoc IHedgingReactor
	function getPoolDenominatedValue() external view returns (uint256 value) {
		return ERC20(collateralAsset).balanceOf(address(this));
	}

	//////////////////////////
	/// internal utilities ///
	//////////////////////////

	function _getOptionDetails(address seriesAddress, Types.OptionSeries memory optionSeries, IOptionRegistry optionRegistry)
		internal
		view
		returns (
			address,
			Types.OptionSeries memory,
			uint128
		)
	{
		// if the series address is not known then we need to find it by looking for the otoken,
		// if we cant find it then it means the otoken hasnt been created yet, strike is e18
		if (seriesAddress == address(0)) {
			seriesAddress = optionRegistry.getOtoken(
				optionSeries.underlying,
				optionSeries.strikeAsset,
				optionSeries.expiration,
				optionSeries.isPut,
				optionSeries.strike,
				optionSeries.collateral
			);
			optionSeries = Types.OptionSeries(
				optionSeries.expiration,
				uint128(formatStrikePrice(optionSeries.strike, collateralAsset)),
				optionSeries.isPut,
				optionSeries.underlying,
				optionSeries.strikeAsset,
				optionSeries.collateral
			);
		} else {
			// if the series address was passed in as non zero then we'll first check the option registry storage,
			// if its not there then we know this isnt a buyback operation
			optionSeries = optionRegistry.getSeriesInfo(seriesAddress);
			// make sure the expiry actually exists, if it doesnt then get the otoken itself
			if (optionSeries.expiration == 0) {
				IOtoken otoken = IOtoken(seriesAddress);
				// get the option details
				optionSeries = Types.OptionSeries(
					uint64(otoken.expiryTimestamp()),
					uint128(otoken.strikePrice()),
					otoken.isPut(),
					otoken.underlyingAsset(),
					otoken.strikeAsset(),
					otoken.collateralAsset()
				);
			}
		}
		if (seriesAddress == address(0)) {
			revert CustomErrors.NonExistentOtoken();
		}
		// strike is in e18
		// make sure the expiry actually exists
		if (optionSeries.expiration == 0) {
			revert CustomErrors.NonExistentOtoken();
		}
		// strikeDecimalConverted is the formatted strike price (for e8) in e18 format
		// option series returned with e8
		uint128 strikeDecimalConverted = uint128(optionSeries.strike * 10**CONVERSION_DECIMALS);
		// we need to make sure the seriesAddress is actually whitelisted as an otoken in case the actor wants to
		// try sending a made up otoken
		IWhitelist whitelist = IWhitelist(addressbook.getWhitelist());
		if (!whitelist.isWhitelistedOtoken(seriesAddress)) {
			revert CustomErrors.NonExistentOtoken();
		}
		return (seriesAddress, optionSeries, strikeDecimalConverted);
	}

	function _checkHash(
		Types.OptionSeries memory optionSeries,
		uint128 strikeDecimalConverted,
		bool isSell
	) public view {
		// check if the option series is approved
		bytes32 oHash = keccak256(
			abi.encodePacked(optionSeries.expiration, strikeDecimalConverted, optionSeries.isPut)
		);
		if (!approvedOptions[oHash]) {
			revert CustomErrors.UnapprovedSeries();
		}
		if (isSell) {
			if (!isSellable[oHash]) {
				revert CustomErrors.SeriesNotSellable();
			}
		} else {
			if (!isBuyable[oHash]) {
				revert CustomErrors.SeriesNotBuyable();
			}
		}
		if (optionSeries.expiration <= block.timestamp) {
			revert CustomErrors.OptionExpiryInvalid();
		}
		if (optionSeries.underlying != underlyingAsset) {
			revert CustomErrors.UnderlyingAssetInvalid();
		}
		if (optionSeries.strikeAsset != strikeAsset) {
			revert CustomErrors.StrikeAssetInvalid();
		}
		
	}

	/**
	 * @notice Converts strike price to 1e8 format and floors least significant digits if needed
	 * @param  strikePrice strikePrice in 1e18 format
	 * @param  collateral address of collateral asset
	 * @return if the transaction succeeded
	 */
	function formatStrikePrice(uint256 strikePrice, address collateral) public view returns (uint256) {
		// convert strike to 1e8 format
		uint256 price = strikePrice / (10**10);
		uint256 collateralDecimals = ERC20(collateral).decimals();
		if (collateralDecimals >= OPYN_DECIMALS) return price;
		uint256 difference = OPYN_DECIMALS - collateralDecimals;
		// round floor strike to prevent errors in Gamma protocol
		return (price / (10**difference)) * (10**difference);
	}

	function getSeriesWithe18Strike(Types.OptionSeries memory optionSeries)
		external
		view
		returns (address)
	{
		return
			IOptionRegistry(getOptionRegistry()).getSeries(
				Types.OptionSeries(
					optionSeries.expiration,
					uint128(formatStrikePrice(optionSeries.strike, optionSeries.collateral)),
					optionSeries.isPut,
					optionSeries.underlying,
					optionSeries.strikeAsset,
					optionSeries.collateral
				)
			);
	}

	/** @notice function to sell exact amount of wETH to decrease delta
	 *  @param _amountIn the exact amount of wETH to sell
	 *  @param _amountOutMinimum the min amount of stablecoin willing to receive. Slippage limit.
	 *  @param _assetIn the stablecoin to buy
	 *  @return the amount of usdc received
	 */
	function _swapExactInputSingle(
		uint256 _amountIn,
		uint256 _amountOutMinimum,
		address _assetIn
	) internal returns (uint256) {
		uint24 poolFee = poolFees[_assetIn];
		if (poolFee == 0) {
			revert PoolFeeNotSet();
		}
		ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
			tokenIn: _assetIn,
			tokenOut: collateralAsset,
			fee: poolFee,
			recipient: address(this),
			deadline: block.timestamp,
			amountIn: _amountIn,
			amountOutMinimum: _amountOutMinimum,
			sqrtPriceLimitX96: 0
		});

		// The call to `exactInputSingle` executes the swap.
		uint256 amountOut = swapRouter.exactInputSingle(params);
		return amountOut;
	}

	function _updateTempHoldings(IController.ActionArgs memory action) internal {
			if (heldOtokens[msg.sender][action.asset] == 0){
				tempSeriesQueue[msg.sender].push(action.asset);
			}
			heldOtokens[msg.sender][action.asset] += action.amount * 10 ** CONVERSION_DECIMALS;
		
	}

	function min(uint256 v1, uint256 v2) internal pure returns (uint256) {
		return v1 > v2 ? v2 : v1;
	}
}
