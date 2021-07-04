// SPDX-License-Identifier: MIT
pragma solidity >=0.4.1 <0.9.0;

contract DappToken {

    string public name = "Dapp Token";
    string public symbol = "DAPP";
    string public standard = "DApp Token v1.0";
    uint256 public totalSupply;
    
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    // Approval event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;  // allowance

    constructor(uint256 _initialSupply) {
        // totalSupply = 1000000;
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer DappTokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Exception if account doesnt have enough bal.
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Transfer Event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // Delegated Transfer
    // approve
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // allowance
        allowance[msg.sender][_spender] = _value;
        // Approval event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transfer from
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value; // update the allowance
        emit Transfer(_from, _to, _value);
        return true;
    }
}