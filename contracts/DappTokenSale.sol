// SPDX-License-Identifier: MIT
pragma solidity >=0.4.1 <0.9.0;
import "./DappToken.sol";

contract DappTokenSale {

    address admin;
    DappToken public tokenContract; // 对象实例化?
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor(DappToken _tokenContract, uint256 _tokenPrice) {
        // Assign an admin
        admin = msg.sender;
        // Token contract
        tokenContract = _tokenContract;
        // Token price
        tokenPrice = _tokenPrice;
    }

    // safe math calc.
    function multiply(uint x, uint y) internal pure returns(uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buy tokens
    // Notes: 涉及到以太币转移 -> 加上 payable
    // the expression inside `require` statement will be executed.
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens)); // actual buy token function
        // keep track of tokens sold
        tokensSold += _numberOfTokens;

        // emit Sell Event
        emit Sell(msg.sender, _numberOfTokens);

    }
}