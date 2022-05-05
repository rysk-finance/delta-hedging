// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../libraries/Types.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ILiquidityPool.sol";
/**
 * @title The Mock PortfolioValuesFeed contract - NEVER USE THIS IN PRODUCTION! FOR TESTING ONLY!
 * @notice An external adapter Consumer contract that makes requests to obtain portfolio values for different pools
 */
contract MockPortfolioValuesFeed is Ownable {

  mapping(address => mapping(address => Types.PortfolioValues)) private portfolioValues;
  address private immutable oracle;
  bytes32 private immutable jobId;
  uint256 private immutable fee;
  address private immutable link;
  ILiquidityPool public liquidityPool;
  bytes32 private latestId;
  event DataFullfilled(address indexed underlying, address indexed strike, int256 delta, int256 gamma, int256 vega, int256 theta, uint256 callPutsValue);

  /**
   * @notice Executes once when a contract is created to initialize state variables
   *
   * @param _oracle - address of the specific Chainlink node that a contract makes an API call from
   * @param _jobId - specific job for :_oracle: to run; each job is unique and returns different types of data
   * @param _fee - node operator price per API call / data request
   * @param _link - LINK token address on the corresponding network
   */
  constructor(
    address _oracle,
    bytes32 _jobId,
    uint256 _fee,
    address _link
  ) {

    oracle = _oracle;
    jobId = _jobId;
    fee = _fee;
    link = _link;
  }

  function setLiquidityPool(address _liquidityPool) external onlyOwner {
    liquidityPool = ILiquidityPool(_liquidityPool);
  }

  function getPortfolioValues(
    address underlying,
    address strike
  ) external 
    view
    returns (Types.PortfolioValues memory) {
        return portfolioValues[underlying][strike];
  }

  /**
   * @notice Creates a Chainlink request to update portfolio values
   * data, then multiply by 1000000000000000000 (to remove decimal places from data).
   *
   */
  function requestPortfolioData(string memory _underlying, string memory _strike) public {

/*     request.add("endpoint", "portfolio-values");
    request.add("underlying", _underlying);
    request.add("strike", _strike);

    // Multiply the result by 1000000000000000000 to remove decimals
    int256 timesAmount = 10**18;
    request.addInt("times", timesAmount);

    // Sends the request
    return sendChainlinkRequestTo(oracle, request, fee);
 */  }

  /**
   * @notice Receives the response
   *
   * @param _requestId - id of the request
   * @param _underlying - response; underlying address
   * @param _strike - response; strike address
   * @param _delta - response; portfolio delta
   * @param _gamma - response; portfolio gamma
   * @param _vega - response; portfolio vega
   * @param _theta - response; portfolio theta
   * @param _callPutsValue - response; combined value of calls and puts written
   * @param _spotPrice - response; spot price at the time of update
   */
function fulfill(
    bytes32 _requestId,
    address _underlying,
    address _strike,
    int256 _delta,
    int256 _gamma,
    int256 _vega,
    int256 _theta,
    uint256 _callPutsValue,
    uint256 _spotPrice
)
    public
  {
    Types.PortfolioValues memory portfolioValue = Types.PortfolioValues({
        delta: _delta,
        gamma: _gamma,
        vega: _vega,
        theta: _theta,
        callPutsValue: _callPutsValue,
        spotPrice: _spotPrice,
        timestamp: block.timestamp
    });
    latestId = _requestId;
    portfolioValues[_underlying][_strike] = portfolioValue;
    liquidityPool.resetEphemeralValues();
    emit DataFullfilled(_underlying, _strike, _delta, _gamma, _vega, _theta, _callPutsValue);
  }

  /**
   * @notice Witdraws LINK from the contract
   * @dev Implement a withdraw function to avoid locking your LINK in the contract
   */
  function withdrawLink() external {}
}