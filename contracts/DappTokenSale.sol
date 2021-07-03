// SPDX-License-Identifier: MIT
pragma solidity >=0.4.1 <0.9.0;
import "./DappToken.sol";

contract DappTokenSale {

    address admin;
    DappToken public tokenContract; // 对象实例化?
    uint256 public tokenPrice;

    constructor(DappToken _tokenContract, uint256 _tokenPrice) {
        // Assign an admin
        admin = msg.sender;
        // Token contract
        tokenContract = _tokenContract;
        // Token price
        tokenPrice = _tokenPrice;
    }
}