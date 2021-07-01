// SPDX-License-Identifier: MIT
pragma solidity >=0.4.1 <0.9.0;

contract DappToken {

    string public name = "Dapp Token";
    string public symbol = "DAPP";
    string public standard = "DApp Token v1.0";
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) public {
        // totalSupply = 1000000;
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer function
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Exception if account doesnt have enough bal.
        require(balanceOf[msg.sender] >= _value);
    }
}