//SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";

contract FundMe {
    address public owner;
    address[] public funders;
    mapping(address => uint256) public addressToFunded;
    // access the price of eth && btc
    AggregatorV3Interface public priceFeedEth;

    using SafeMathChainlink for uint256;

    constructor(address _priceFeed) public {
        owner = msg.sender;
        // https://docs.chain.link/data-feeds/price-feeds/addresses/?network=ethereum
        priceFeedEth = AggregatorV3Interface(_priceFeed);
        //0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
    }

    function getPrice() public view returns (uint256) {
        (, int256 answerEth, , , ) = priceFeedEth.latestRoundData();
        //return the answer in wei (18 zeros)
        return uint256(answerEth * 10000000000);
    }

    function getEntranceFee() public view returns (uint256) {
        // minimumUSD
        uint256 minimumUSD = 50 * 10**18;
        uint256 price = getPrice();
        uint256 precision = 1 * 10**18;
        // return (minimumUSD * precision) / price;
        // We fixed a rounding error found in the video by adding one!
        return ((minimumUSD * precision) / price) + 1;
    }

    function convertEth(uint256 ethDeposit) public view returns (uint256) {
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * ethDeposit) / 1000000000000000000;
        return ethAmountInUsd;
    }

    modifier costs() {
        uint256 minUSD = 50 * 10**18;
        require(convertEth(msg.value) >= minUSD, "Send more eth!");
        _;
    }

    function fund() public payable costs {
        //check the price is > 1 ether

        addressToFunded[msg.sender] = msg.value;
        funders.push(msg.sender);
    }

    modifier OwnlyOwner() {
        require(payable(msg.sender) == owner, "only the owner can withdraw");
        _;
    }

    function withdraw() public payable OwnlyOwner {
        payable(msg.sender).transfer(address(this).balance);
        // now we want to loop through the array and set it to zero
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToFunded[funder] = 0;
        }
        funders = new address[](0);
    }

    // returns the value deposited
    function getValueDeposited(address _addy) public view returns (uint256) {
        uint256 value = addressToFunded[_addy];
        return value / 1000000000000000000;
    }
}
