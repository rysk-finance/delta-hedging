// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Protocol.sol";
import "./PriceFeed.sol";

import "./tokens/ERC20.sol";
import "./libraries/Types.sol";
import "./utils/ReentrancyGuard.sol";
import "./libraries/CustomErrors.sol";
import "./libraries/AccessControl.sol";
import "./libraries/OptionsCompute.sol";
import "./libraries/SafeTransferLib.sol";

import "./interfaces/ILiquidityPool.sol";
import "./interfaces/IOptionRegistry.sol";
import "./interfaces/IPortfolioValuesFeed.sol";

import "prb-math/contracts/PRBMathSD59x18.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

import "@openzeppelin/contracts/security/Pausable.sol";

/**
 *  @title Contract used for all user facing options interactions
 *  @dev Interacts with liquidityPool to write options and quote their prices.
 */
contract OptionHandler is Pausable, AccessControl, ReentrancyGuard {
	using PRBMathSD59x18 for int256;
	using PRBMathUD60x18 for uint256;

	///////////////////////////
	/// immutable variables ///
	///////////////////////////

	// Protocol management contracts
	ILiquidityPool public immutable liquidityPool;
	Protocol public immutable protocol;
	// asset that denominates the strike price
	address public immutable strikeAsset;
	// asset that is used as the reference asset
	address public immutable underlyingAsset;
	// asset that is used for collateral asset
	address public immutable collateralAsset;

	/////////////////////////
	/// dynamic variables ///
	/////////////////////////

	// order id counter
	uint256 public orderIdCounter;
	// custom option orders
	mapping(uint256 => Types.Order) public orderStores;

	/////////////////////////////////////
	/// governance settable variables ///
	/////////////////////////////////////

	// settings for the limits of a custom order
	CustomOrderBounds public customOrderBounds = CustomOrderBounds(0, 25e16, -25e16, 0, 1000);
	// addresses that are whitelisted to sell options back to the protocol
	mapping(address => bool) public buybackWhitelist;
	// minimum delta to trigger a request
	uint256 public minDeltaForRequest = 1e17;

	//////////////////////////
	/// constant variables ///
	//////////////////////////

	// BIPS
	uint256 private constant MAX_BPS = 10_000;
	// custom order maximum time for liveness
	uint256 private constant maxOrderExpiry = 1800;

	/////////////////////////
	/// structs && events ///
	/////////////////////////

	// delta and price boundaries for custom orders
	struct CustomOrderBounds {
		uint128 callMinDelta; // call delta will always be between 0 and 1 (e18)
		uint128 callMaxDelta; // call delta will always be between 0 and 1 (e18)
		int128 putMinDelta; // put delta will always be between 0 and -1 (e18)
		int128 putMaxDelta; // put delta will always be between 0 and -1 (e18)
		// maxPriceRange is the maximum percentage below the LP calculated price,
		// measured in BPS, that the order may be sold for. 10% would mean maxPriceRange = 1000
		uint32 maxPriceRange;
	}

	event OrderCreated(uint256 orderId);
	event OrderExecuted(uint256 orderId);

	constructor(
		address _authority,
		address _protocol,
		address _liquidityPool
	) AccessControl(IAuthority(_authority)) {
		protocol = Protocol(_protocol);
		liquidityPool = ILiquidityPool(_liquidityPool);
		collateralAsset = liquidityPool.collateralAsset();
		underlyingAsset = liquidityPool.underlyingAsset();
		strikeAsset = liquidityPool.strikeAsset();
	}

	///////////////
	/// setters ///
	///////////////

	/**
	 * @notice set new custom order parameters
	 * @param _callMinDelta the minimum delta value a sold custom call option can have (e18 format - for 0.05 enter 5e16). Must be positive or 0.
	 * @param _callMaxDelta the maximum delta value a sold custom call option can have. Must be positive and have greater magnitude than _callMinDelta.
	 * @param _putMinDelta the minimum delta value a sold custom put option can have. Must be negative and have greater magnitude than _putMaxDelta
	 * @param _putMaxDelta the maximum delta value a sold custom put option can have. Must be negative or 0.
	 * @param _maxPriceRange the max percentage below the LP calculated premium that the order may be sold for. Measured in BPS - for 10% enter 1000
	 */
	function setCustomOrderBounds(
		uint128 _callMinDelta,
		uint128 _callMaxDelta,
		int128 _putMinDelta,
		int128 _putMaxDelta,
		uint32 _maxPriceRange
	) external {
		_onlyGovernor();
		customOrderBounds.callMinDelta = _callMinDelta;
		customOrderBounds.callMaxDelta = _callMaxDelta;
		customOrderBounds.putMinDelta = _putMinDelta;
		customOrderBounds.putMaxDelta = _putMaxDelta;
		customOrderBounds.maxPriceRange = _maxPriceRange;
	}

	function pause() external {
		_onlyGuardian();
		_pause();
	}

	function unpause() external {
		_onlyGuardian();
		_unpause();
	}

	/**
	 * @notice add or remove addresses who have no restrictions on the options they can sell back to the pool
	 */
	function addOrRemoveBuybackAddress(address _addressToWhitelist, bool toAdd) external {
		_onlyGovernor();
		buybackWhitelist[_addressToWhitelist] = toAdd;
	}

	/**
	 * @notice the minimum required delta of the trade to trigger a request
	 */
	function setMinDeltaForRequest(uint256 _minDeltaForRequest) external {
		_onlyGovernor();
		minDeltaForRequest = _minDeltaForRequest;
	}

	//////////////////////////////////////////////////////
	/// access-controlled state changing functionality ///
	//////////////////////////////////////////////////////

	/**
	 * @notice creates an order for a number of options from the pool to a specified user. The function
	 *      is intended to be used to issue options to market makers/ OTC market participants
	 *      in order to have flexibility and customisability on option issuance and market
	 *      participant UX.
	 * @param _optionSeries the option token series to issue - strike in e18
	 * @param _amount the number of options to issue - e18
	 * @param _price the price per unit to issue at - in e18
	 * @param _orderExpiry the expiry of the custom order, after which the 
	 *        buyer cannot use this order (if past the order is redundant)
	 * @param _buyerAddress the agreed upon buyer address
	 * @return orderId the unique id of the order
	 */
	function createOrder(
		Types.OptionSeries memory _optionSeries,
		uint256 _amount,
		uint256 _price,
		uint256 _orderExpiry,
		address _buyerAddress,
		uint256[2] memory _spotMovementRange
	) public returns (uint256) {
		_onlyManager();
		if (_price == 0) {
			revert CustomErrors.InvalidPrice();
		}
		if (_orderExpiry > maxOrderExpiry) {
			revert CustomErrors.OrderExpiryTooLong();
		}
		IOptionRegistry optionRegistry = getOptionRegistry();
		// issue the option type, all checks of the option validity should happen in _issue
		address series = liquidityPool.handlerIssue(_optionSeries);
		uint256 spotPrice = _getUnderlyingPrice(underlyingAsset, strikeAsset);
		// create the order struct, setting the series, amount, price, order expiry and buyer address
		Types.Order memory order = Types.Order(
			optionRegistry.getSeriesInfo(series), // strike in e8
			_amount, // amount in e18
			_price, // in e18
			block.timestamp + _orderExpiry,
			_buyerAddress,
			series,
			uint128(spotPrice - _spotMovementRange[0]), 
			uint128(spotPrice + _spotMovementRange[1]),
			false
		);
		uint256 orderIdCounter__ = orderIdCounter + 1;
		// increment the orderId and store the order
		orderStores[orderIdCounter__] = order;
		emit OrderCreated(orderIdCounter__);
		orderIdCounter = orderIdCounter__;
		return orderIdCounter__;
	}

	/**
	 * @notice creates a strangle order. One custom put and one custom call order to be executed simultaneously.
	 * @param _optionSeriesCall the option token series to issue for the call part of the strangle - strike in e18
	 * @param _optionSeriesPut the option token series to issue for the put part of the strangle - strike in e18
	 * @param _amountCall the number of call options to issue
	 * @param _amountPut the number of put options to issue
	 * @param _priceCall the price per unit to issue calls at
	 * @param _pricePut the price per unit to issue puts at
	 * @param _orderExpiry the expiry of the order (if past the order is redundant)
	 * @param _buyerAddress the agreed upon buyer address
	 * @return putOrderId the unique id of the put part of the strangle
	 * @return callOrderId the unique id of the call part of the strangle
	 */
	function createStrangle(
		Types.OptionSeries memory _optionSeriesCall,
		Types.OptionSeries memory _optionSeriesPut,
		uint256 _amountCall,
		uint256 _amountPut,
		uint256 _priceCall,
		uint256 _pricePut,
		uint256 _orderExpiry,
		address _buyerAddress,
		uint256[2] memory _callSpotMovementRange,
		uint256[2] memory _putSpotMovementRange
	) external returns (uint256, uint256) {
		_onlyManager();
		uint256 callOrderId = createOrder(
			_optionSeriesCall,
			_amountCall,
			_priceCall,
			_orderExpiry,
			_buyerAddress,
			_callSpotMovementRange
		);
		uint256 putOrderId = createOrder(
			_optionSeriesPut,
			_amountPut,
			_pricePut,
			_orderExpiry,
			_buyerAddress,
			_putSpotMovementRange
		);
		return (putOrderId, callOrderId);
	}

	/**
	 * @notice fulfills an order for a number of options from the pool to a specified user. The function
	 *      is intended to be used to issue options to market makers/ OTC market participants
	 *      in order to have flexibility and customisability on option issuance and market
	 *      participant UX.
	 * @param  _orderId the id of the order for options purchase
	 */
	function executeOrder(uint256 _orderId) public nonReentrant {
		// get the order
		Types.Order memory order = orderStores[_orderId];
		// check that the sender is the authorised buyer of the order
		if (msg.sender != order.buyer) {
			revert CustomErrors.InvalidBuyer();
		}
		// check that the order is still valid
		if (block.timestamp > order.orderExpiry) {
			revert CustomErrors.OrderExpired();
		}
		uint256 spotPrice = _getUnderlyingPrice(underlyingAsset, strikeAsset);
		// If spot price has deviated too much we want to void the order
		if (order.lowerSpotMovementRange > spotPrice || order.upperSpotMovementRange < spotPrice ) {
			revert CustomErrors.SpotMovedBeyondRange();
		}
		(uint256 poolCalculatedPremium, int256 delta) = liquidityPool.quotePriceWithUtilizationGreeks(
			Types.OptionSeries({
				expiration: order.optionSeries.expiration,
				strike: uint128(
					OptionsCompute.convertFromDecimals(
						order.optionSeries.strike,
						ERC20(order.seriesAddress).decimals()
					)
				),
				isPut: order.optionSeries.isPut,
				underlying: order.optionSeries.underlying,
				strikeAsset: order.optionSeries.strikeAsset,
				collateral: order.optionSeries.collateral
			}),
			order.amount,
			false
		);
		// calculate the total premium
		uint256 premium = (order.amount * order.price) / 1e18;
		// check the agreed upon premium is within acceptable range of pool's own pricing model
		if (
			poolCalculatedPremium - ((poolCalculatedPremium * customOrderBounds.maxPriceRange) / MAX_BPS) >
			premium
		) {
			revert CustomErrors.CustomOrderInsufficientPrice();
		}
		// check that the delta values of the options are within acceptable ranges
		// if isPut, delta will always be between 0 and -1e18
		int256 unitDelta = delta.div(int256(order.amount));
		if (order.optionSeries.isPut) {
			if (customOrderBounds.putMinDelta > unitDelta || unitDelta > customOrderBounds.putMaxDelta) {
				revert CustomErrors.CustomOrderInvalidDeltaValue();
			}
		} else {
			if (
				customOrderBounds.callMinDelta > uint256(unitDelta) ||
				uint256(unitDelta) > customOrderBounds.callMaxDelta
			) {
				revert CustomErrors.CustomOrderInvalidDeltaValue();
			}
		}
		address collateralAsset_ = collateralAsset;
		uint256 convertedPrem = OptionsCompute.convertToDecimals(
			premium,
			ERC20(collateralAsset_).decimals()
		);
		// premium needs to adjusted for decimals of collateral asset
		SafeTransferLib.safeTransferFrom(
			collateralAsset_,
			msg.sender,
			address(liquidityPool),
			convertedPrem
		);
		// write the option contract, includes sending the premium from the user to the pool, option series should be in e8
		liquidityPool.handlerWriteOption(
			order.optionSeries,
			order.seriesAddress,
			order.amount,
			getOptionRegistry(),
			OptionsCompute.convertToDecimals(poolCalculatedPremium, ERC20(collateralAsset_).decimals()),
			delta,
			msg.sender
		);
		emit OrderExecuted(_orderId);
		// invalidate the order
		delete orderStores[_orderId];
	}

	/**
	 * @notice fulfills a stored strangle order consisting of a stores call and a stored put.
	 * This is intended to be called by market makers/OTC market participants.
	 */
	function executeStrangle(uint256 _orderId1, uint256 _orderId2) external {
		executeOrder(_orderId1);
		executeOrder(_orderId2);
	}

	/////////////////////////////////////////////
	/// external state changing functionality ///
	/////////////////////////////////////////////

	/**
	 * @notice write a number of options for a given series addres
	 * @param  optionSeries option type to mint - strike in e18
	 * @param  amount       the number of options to mint in e18
	 * @return optionAmount the number of options minted in 2
	 * @return series       the address of the option series minted
	 */
	function issueAndWriteOption(Types.OptionSeries memory optionSeries, uint256 amount)
		external
		whenNotPaused
		nonReentrant
		returns (uint256 optionAmount, address series)
	{
		// calculate premium
		(uint256 premium, int256 delta) = liquidityPool.quotePriceWithUtilizationGreeks(
			optionSeries,
			amount,
			false
		);
		// premium needs to adjusted for decimals of collateral asset
		uint256 convertedPrem = OptionsCompute.convertToDecimals(
			premium,
			ERC20(collateralAsset).decimals()
		);
		SafeTransferLib.safeTransferFrom(
			collateralAsset,
			msg.sender,
			address(liquidityPool),
			convertedPrem
		);
		// write the option, optionAmount in e18
		(optionAmount, series) = liquidityPool.handlerIssueAndWriteOption(
			optionSeries,
			amount,
			convertedPrem,
			delta,
			msg.sender
		);
		if (uint256(delta.abs()) > minDeltaForRequest) {
			getPortfolioValuesFeed().requestPortfolioData(underlyingAsset, strikeAsset);
		}
	}

	/**
	 * @notice issue a series
	 * @param  optionSeries option type to mint - strike in e18
	 * @return series       the address of the option series minted
	 */
	function issue(Types.OptionSeries memory optionSeries)
		external
		whenNotPaused
		nonReentrant
		returns (address series)
	{
		// issue the option
		series = liquidityPool.handlerIssue(optionSeries);
	}

	/**
	 * @notice write a number of options for a given series address
	 * @param  seriesAddress the option token series address
	 * @param  amount        the number of options to mint expressed as 1e18
	 * @return number of options minted
	 */
	function writeOption(address seriesAddress, uint256 amount)
		external
		whenNotPaused
		nonReentrant
		returns (uint256)
	{
		IOptionRegistry optionRegistry = getOptionRegistry();
		// get the option series from the pool
		Types.OptionSeries memory optionSeries = optionRegistry.getSeriesInfo(seriesAddress);
		if (optionSeries.expiration == 0) {
			revert CustomErrors.NonExistentOtoken();
		}
		// calculate premium, strike needs to be in e18
		(uint256 premium, int256 delta) = liquidityPool.quotePriceWithUtilizationGreeks(
			Types.OptionSeries({
				expiration: optionSeries.expiration,
				strike: uint128(
					OptionsCompute.convertFromDecimals(optionSeries.strike, ERC20(seriesAddress).decimals())
				),
				isPut: optionSeries.isPut,
				underlying: optionSeries.underlying,
				strikeAsset: optionSeries.strikeAsset,
				collateral: optionSeries.collateral
			}),
			amount,
			false
		);
		// premium needs to adjusted for decimals of collateral asset
		uint256 convertedPrem = OptionsCompute.convertToDecimals(
			premium,
			ERC20(collateralAsset).decimals()
		);
		SafeTransferLib.safeTransferFrom(
			collateralAsset,
			msg.sender,
			address(liquidityPool),
			convertedPrem
		);
		if (uint256(delta.abs()) > minDeltaForRequest) {
			getPortfolioValuesFeed().requestPortfolioData(underlyingAsset, strikeAsset);
		}
		return
			liquidityPool.handlerWriteOption(
				optionSeries,
				seriesAddress,
				amount,
				optionRegistry,
				convertedPrem,
				delta,
				msg.sender
			);
	}

	/**
	 * @notice buys a number of options back and burns the tokens
	 * @param seriesAddress the option token series address to buyback
	 * @param amount the number of options to buyback expressed in 1e18
	 * @return the number of options bought and burned
	 */
	function buybackOption(address seriesAddress, uint256 amount)
		external
		nonReentrant
		whenNotPaused
		returns (uint256)
	{
		IOptionRegistry optionRegistry = getOptionRegistry();
		// get the option series from the pool
		Types.OptionSeries memory optionSeries = optionRegistry.getSeriesInfo(seriesAddress);
		if (optionSeries.expiration == 0) {
			revert CustomErrors.NonExistentOtoken();
		}
		// revert if the expiry is in the past
		if (optionSeries.expiration <= block.timestamp) {
			revert CustomErrors.OptionExpiryInvalid();
		}
		uint128 strikeDecimalConverted = uint128(
			OptionsCompute.convertFromDecimals(optionSeries.strike, ERC20(seriesAddress).decimals())
		);
		// get Liquidity pool quote on the option to buy back, always return the total values
		(uint256 premium, int256 delta) = liquidityPool.quotePriceWithUtilizationGreeks(
			Types.OptionSeries(
				optionSeries.expiration,
				strikeDecimalConverted, // convert from 1e8 to 1e18 notation for quotePrice
				optionSeries.isPut,
				optionSeries.underlying,
				optionSeries.strikeAsset,
				collateralAsset
			),
			amount,
			true
		);
		// if option seller is not on our whitelist, run some extra checks
		if (!buybackWhitelist[msg.sender]) {
			int256 portfolioDelta = liquidityPool.getPortfolioDelta();
			// the delta is returned as the option delta so add the delta of the option
			int256 newDelta = PRBMathSD59x18.abs(portfolioDelta + delta);
			bool isDecreased = newDelta < PRBMathSD59x18.abs(portfolioDelta);
			if (!isDecreased) {
				revert CustomErrors.DeltaNotDecreased();
			}
		}
		// premium needs to adjusted for decimals of collateral asset
		uint256 convertedPrem = OptionsCompute.convertToDecimals(
			premium,
			ERC20(collateralAsset).decimals()
		);
		SafeTransferLib.safeTransferFrom(
			seriesAddress,
			msg.sender,
			address(liquidityPool),
			OptionsCompute.convertToDecimals(amount, ERC20(seriesAddress).decimals())
		);
		if (uint256(delta.abs()) > minDeltaForRequest) {
			getPortfolioValuesFeed().requestPortfolioData(underlyingAsset, strikeAsset);
		}
		return
			liquidityPool.handlerBuybackOption(
				optionSeries,
				amount,
				optionRegistry,
				seriesAddress,
				convertedPrem,
				delta,
				msg.sender
			);
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
	function getPortfolioValuesFeed() internal view returns (IPortfolioValuesFeed) {
		return IPortfolioValuesFeed(protocol.portfolioValuesFeed());
	}

	/**
	 * @notice get the underlying price with just the underlying asset and strike asset
	 * @param underlying   the asset that is used as the reference asset
	 * @param _strikeAsset the asset that the underlying value is denominated in
	 * @return the underlying price
	 */
	function _getUnderlyingPrice(address underlying, address _strikeAsset)
		internal
		view
		returns (uint256)
	{
		return PriceFeed(protocol.priceFeed()).getNormalizedRate(underlying, _strikeAsset);
	}
}
