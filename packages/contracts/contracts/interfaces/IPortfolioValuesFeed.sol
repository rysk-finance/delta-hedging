// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "../libraries/Types.sol";
interface IPortfolioValuesFeed {

  /////////////////////////////////////////////
  /// external state changing functionality ///
  /////////////////////////////////////////////

  /**
   * @notice Creates a Chainlink request to update portfolio values
   * data, then multiply by 1000000000000000000 (to remove decimal places from data).
   *
   * @return requestId - id of the request
   */
  function requestPortfolioData(address _underlying, address _strike) external returns (bytes32 requestId);
  ///////////////////////////
  /// non-complex getters ///
  ///////////////////////////

  function getPortfolioValues(
    address underlying,
    address strike
  ) external 
    view
    returns (Types.PortfolioValues memory);

  function completedRequests(bytes32) external returns (bool);
}
