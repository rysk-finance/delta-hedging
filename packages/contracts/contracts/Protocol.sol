// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
contract Protocol is Ownable {

    ////////////////////////
    /// static variables ///
    ////////////////////////

    address public optionRegistry;
    address public priceFeed;

    /////////////////////////////////////
    /// governance settable variables ///
    /////////////////////////////////////

    address public volatilityFeed;
    address public portfolioValuesFeed;

    constructor(
       address _optionRegistry,
       address _priceFeed,
       address _volatilityFeed,
       address _portfolioValuesFeed
    ) {
        optionRegistry = _optionRegistry;
        priceFeed = _priceFeed;
        volatilityFeed = _volatilityFeed;
        portfolioValuesFeed = _portfolioValuesFeed;
    }

    ///////////////
    /// setters ///
    ///////////////

    function changeVolatilityFeed(address _volFeed) external onlyOwner {
        volatilityFeed = _volFeed;
    }

    function changePortfolioValuesFeed(address _portfolioValuesFeed) external onlyOwner {
        portfolioValuesFeed = _portfolioValuesFeed;
    }

}

