pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import { Constants } from "./libraries/Constants.sol";
import { OptionsCompute } from "./libraries/OptionsCompute.sol";
import { TransferHelper } from "./libraries/TransferHelper.sol";
import "./tokens/ERC20.sol";
import "./OptionRegistry.sol";
import "./libraries/ABDKMathQuad.sol";
import "./libraries/BlackScholes.sol";
import "./tokens/UniversalERC20.sol";
import "./OptionsProtocol.sol";
import "./PriceFeed.sol";
import "./access/Ownable.sol";
import "prb-math/contracts/PRBMathSD59x18.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";
// import "hardhat/console.sol";

contract LiquidityPool is
  BlackScholes,
  ERC20,
  Ownable
{
  using UniversalERC20 for IERC20;
  using ABDKMathQuad for bytes16;
  using PRBMathSD59x18 for int256;
  using PRBMathUD60x18 for uint256;

  bytes16 private constant ONE = 0x3fff0000000000000000000000000000;

  address public protocol;
  address public strikeAsset;
  address public underlyingAsset;
  uint public riskFreeRate;
  uint public strikeAllocated;
  uint public underlyingAllocated;

  uint public totalAmountCall;
  uint public totalAmountPut;
  uint public weightedStrikeCall;
  uint public weightedTimeCall;
  uint public weightedStrikePut;
  uint public weightedTimePut;
  int[7] public callsVolatilitySkew;
  int[7] public putsVolatilitySkew;
  // Implied volatility for an underlying
  mapping(address => uint) public impliedVolatility;

  event LiquidityAdded(uint amount);
  event UnderlyingAdded(address underlying);
  event ImpliedVolatilityUpdated(address underlying, uint iv);
  event WriteOption(address series, uint amount, uint premium, uint escrow, address buyer);

  constructor(address _protocol, address _strikeAsset, address underlying, uint rfr, uint iv, string memory name, string memory symbol) ERC20(name, symbol) public {
    strikeAsset = IERC20(_strikeAsset).isETH() ? Constants.ethAddress() : _strikeAsset;
    riskFreeRate = rfr;
    address underlyingAddress = IERC20(underlying).isETH() ? Constants.ethAddress() : underlying;
    underlyingAsset = underlyingAddress;
    impliedVolatility[underlyingAddress] = iv;
    protocol = _protocol;
    emit UnderlyingAdded(underlyingAddress);
    emit ImpliedVolatilityUpdated(underlyingAddress, iv);
  }

  function setVolatilitySkew(int[7] calldata values, Types.Flavor flavor)
      onlyOwner
      external
      returns (bool)
  {
      //TODO add modifier for permissioned only
      if (Types.isCall(flavor)) {
          callsVolatilitySkew = values;
      } else {
          putsVolatilitySkew = values;
      }
  }

  function getVolatilitySkew(Types.Flavor flavor)
      external
      view
      returns (int[7] memory)
  {
      if (Types.isCall(flavor)) {
          return callsVolatilitySkew;
      } else {
          return putsVolatilitySkew;
      }
  }

  function addLiquidity(uint amount)
    public
    payable
    returns (bool)
  {
    addTokenLiquidity(amount);
  }

  function addTokenLiquidity(uint amount)
    internal
    returns (bool)
  {
    uint tokenSupply = totalSupply();
    uint decimals = IERC20(strikeAsset).decimals();
    uint exchangeRate = getUnderlyingPrice(underlyingAsset, strikeAsset);
    uint strikeAmount = (exchangeRate * amount) / (10**decimals);
    // needs to transfer underlying as well using ratio param (initially 1)
    uint balance = IERC20(strikeAsset).balanceOf(msg.sender);
    TransferHelper.safeTransferFrom(strikeAsset, msg.sender, address(this), strikeAmount);
    TransferHelper.safeTransferFrom(underlyingAsset, msg.sender, address(this), amount);
    uint newAmount = amount + strikeAmount;
    if (tokenSupply == 0) {
      _mint(msg.sender, newAmount);
      emit LiquidityAdded(newAmount);
      return true;
    }
    uint strikeBalance = IERC20(strikeAsset).universalBalanceOf(address(this));
    uint underlyingBalance = IERC20(underlyingAsset).universalBalanceOf(address(this));
    uint totalBalance = strikeBalance + underlyingBalance;
    uint allocated = strikeAllocated + underlyingAllocated;
    //TODO use underlying and strike allocated
    uint totalAssets =  totalBalance + allocated;
    uint percentage = newAmount.div(totalAssets);
    uint newTokens = percentage.mul(totalAssets);
    _mint(msg.sender, newTokens);
    emit LiquidityAdded(amount);
    //TODO do balance reconcilation here and revert if unbalanced
    return true;
  }

  function getPriceFeed() internal view returns (PriceFeed) {
    address feedAddress = Protocol(protocol).priceFeed();
    return PriceFeed(feedAddress);
  }

  function getOptionRegistry() internal returns (OptionRegistry) {
    address registryAddress = Protocol(protocol).optionRegistry();
    return OptionRegistry(registryAddress);
  }

  function getUnderlyingPrice(
    Types.OptionSeries memory optionSeries
  )
    internal
    view
    returns (uint)
  {
    return getUnderlyingPrice(optionSeries.underlying, optionSeries.strikeAsset);
  }

  function getUnderlyingPrice(
    address underlying,
    address strikeAsset
  )
      internal
      view
      returns (uint)
  {
      PriceFeed priceFeed = getPriceFeed();
      uint underlyingPrice = priceFeed.getNormalizedRate(
        underlying,
        strikeAsset
     );
      return underlyingPrice;
  }

  function quotePrice(
    Types.OptionSeries memory optionSeries
  )
    public
    view
    returns (uint)
  {
    uint iv = impliedVolatility[optionSeries.underlying];
    require(iv > 0, "Implied volatility not found");
    require(optionSeries.expiration > block.timestamp, "Already expired");
    uint underlyingPrice = getUnderlyingPrice(optionSeries);
    return retBlackScholesCalc(
       underlyingPrice,
       optionSeries.strike,
       optionSeries.expiration,
       iv,
       riskFreeRate,
       optionSeries.flavor
    );
  }

  function quotePriceGreeks(
     Types.OptionSeries memory optionSeries
  )
      public
      view
      returns (bytes16 quote, bytes16 delta, uint256 underlyingPrice)
  {
      uint iv = impliedVolatility[optionSeries.underlying];
      require(iv > 0, "Implied volatility not found");
      require(optionSeries.expiration > block.timestamp, "Already expired");
      underlyingPrice = getUnderlyingPrice(optionSeries);
      (quote, delta) = retBlackScholesCalcGreeks(
         underlyingPrice,
         optionSeries.strike,
         optionSeries.expiration,
         iv,
         riskFreeRate,
         optionSeries.flavor
      );
  }

  function getPortfolioDelta()
      public
      view
      returns (bytes16)
  {
      bytes16 price = ABDKMathQuad.fromUInt(getUnderlyingPrice(underlyingAsset, strikeAsset));
      bytes16 vol = ABDKMathQuad.fromUInt(impliedVolatility[underlyingAsset]);
      bytes16 rfr = ABDKMathQuad.fromUInt(riskFreeRate);
      //TODO use skew for volatility
      bytes16 callsDelta = getDeltaBytes(
         price,
         ABDKMathQuad.fromUInt(weightedStrikeCall),
         ABDKMathQuad.fromUInt(weightedTimeCall),
         vol,
         rfr,
         Types.Flavor.Call
      );
      bytes16 putsDelta = getDeltaBytes(
         price,
         ABDKMathQuad.fromUInt(weightedStrikePut),
         ABDKMathQuad.fromUInt(weightedTimePut),
         vol,
         rfr,
         Types.Flavor.Put
      );
      return callsDelta.add(putsDelta);
  }

  function quotePriceWithUtilization(
    Types.OptionSeries memory optionSeries,
    uint amount
  )
    public
    view
    returns (uint)
  {
    uint optionQuote = quotePrice(optionSeries);
    uint optionPrice = amount < PRBMathUD60x18.scale() ? optionQuote.mul(amount) : optionQuote;
    uint underlyingPrice = getUnderlyingPrice(optionSeries);
    uint utilization = amount.div(totalSupply());
    uint utilizationPrice = underlyingPrice.mul(utilization);
    return utilizationPrice > optionPrice ? utilizationPrice : optionPrice;
  }

  function quotePriceWithUtilizationGreeks(
    Types.OptionSeries memory optionSeries,
    uint amount
  )
      public
      view
      returns (bytes16 quote, bytes16 delta)
  {
      bytes16 bytesAmount = ABDKMathQuad.fromUInt(amount);
      (bytes16 optionQuote, bytes16 delta, uint price) = quotePriceGreeks(optionSeries);
      int8 isNegitive = bytesAmount.cmp(ONE);
      bytes16 optionPrice = isNegitive < 0 ? optionQuote.mul(bytesAmount) : optionQuote;
      bytes16 underlyingPrice = ABDKMathQuad.fromUInt(price);
      // factor in portfolio delta
      // if decreases portfolio delta quote standard bs
      // abs(portfolio delta + new delta) < abs(portfolio delta)
      bytes16 utilization = bytesAmount.div(ABDKMathQuad.fromUInt(totalSupply()));
      bytes16 utilizationPrice = underlyingPrice.mul(utilization);
      quote = optionPrice.cmp(utilizationPrice) > 0 ? utilizationPrice : optionPrice;
  }

  function issueAndWriteOption(
     Types.OptionSeries memory optionSeries,
     uint amount,
     address destroy
  ) public payable returns (uint optionAmount, address series)
  {
    OptionRegistry optionRegistry = getOptionRegistry();
    address series = optionRegistry.issue(
       optionSeries.underlying,
       optionSeries.strikeAsset,
       optionSeries.expiration,
       optionSeries.flavor,
       optionSeries.strike
    );
    uint optionAmount = writeOption(series, amount);
    //TODO if destroy address, destroy old option series to reduce gas cost
    return (optionAmount, series);
  }

  function writeOption(
    address seriesAddress,
    uint amount
  )
    public
    payable
    returns (uint)
  {
    OptionRegistry optionRegistry = getOptionRegistry();
    Types.OptionSeries memory optionSeries = optionRegistry.getSeriesInfo(seriesAddress);
    require(optionSeries.strikeAsset == strikeAsset, "incorrect strike asset");
    Types.Flavor flavor = optionSeries.flavor;
    address escrowAsset = Types.isCall(flavor) ? underlyingAsset : strikeAsset;
    (bytes16 premiumBytes, bytes16 delta) = quotePriceWithUtilizationGreeks(optionSeries, amount);
    uint premium = OptionsCompute.toUInt(premiumBytes);
    TransferHelper.safeTransferFrom(strikeAsset, msg.sender, address(this), premium);
    uint escrow = Types.isCall(flavor) ? amount : OptionsCompute.computeEscrow(amount, optionSeries.strike);
    require(IERC20(escrowAsset).universalBalanceOf(address(this)) >= escrow, "Insufficient balance for escrow");
    if (IERC20(optionSeries.underlying).isETH()) {
        optionRegistry.open{value : escrow}(seriesAddress, amount);
        emit WriteOption(seriesAddress, amount, premium, escrow, msg.sender);
    } else {
        IERC20(escrowAsset).approve(address(optionRegistry), escrow);
        optionRegistry.open(seriesAddress, amount);
        emit WriteOption(seriesAddress, amount, premium, escrow, msg.sender);
    }

    if (Types.isCall(flavor)) {
        (uint newTotal, uint newWeight, uint newTime) = OptionsCompute.computeNewWeights(
            amount, optionSeries.strike, optionSeries.expiration, totalAmountCall, weightedStrikeCall, weightedTimeCall);
        totalAmountCall = newTotal;
        weightedStrikeCall = newWeight;
        weightedTimeCall = newTime;
    } else {
        (uint newTotal, uint newWeight, uint newTime) = OptionsCompute.computeNewWeights(
            amount, optionSeries.strike, optionSeries.expiration, totalAmountPut, weightedStrikePut, weightedTimePut);
        totalAmountPut = newTotal;
        weightedStrikePut = newWeight;
        weightedTimePut = newTime;
    }
    IERC20(seriesAddress).universalTransfer(msg.sender, amount);
  }
}
