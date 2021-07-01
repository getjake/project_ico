// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DappToken {
    // Constructor
    // Set total num of tokens
    // Read total num of tokens

    // declare variables
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;


    constructor(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        // allocate initial supply
    }

    // function balanceOf
}