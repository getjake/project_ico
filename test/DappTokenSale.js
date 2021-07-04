const DappTokenSale = artifacts.require("./DappTokenSale.sol");
const DappToken = artifacts.require("./DappToken.sol");

contract('DappTokenSale', function(accounts) {
    // 下面 3 个 it 有先后承接因果关系
    var tokenInstance;
    var tokenSaleInstance;
    var numberOfTokens = 10; // number of tokens to buy
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000; // price in wei - 0.001 eth
    var tokensAvailable = 750000;
    var value = numberOfTokens * tokenPrice;

    it('initializes the contract with correct values', function() {
        return DappTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address){
            // console.log(address)
            assert.notEqual(address, 0x0, 'has contract address.');
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has token contract address.');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'token price is correct');
        })
    });

    it('facilitates token buying', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance; // Grab token instance first
            return DappTokenSale.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance; // Then grab tokenSaleInstance
            // Provision 75% of all tokens to the token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(function(receipt){
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value })
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchase the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the numer of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'buyer has correct balance.')
            // Try to buy tokens diff from the ether value.
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 }); // cheat the system using a small amount of money
        }).then(assert.fail).catch(function(error) {
            // console.log(error.message) // `revert` was not found in the msg. So another string was used.
            assert(error.message.indexOf('expected 10 to equal') >= 0, 'msg.value mush equal number of tokens in wei.');
            return tokenSaleInstance.buyTokens(8000000, { from: buyer, value: value});
        }).then(assert.fail).catch(function(error) {
            // console.log(error.message)
            assert(error.message.indexOf('revert') >= 0, 'purchase value mush be smaller than the amount available.');
        });
    });


    it('ends token sale', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance;
            // Try to end sale from account other than the admin.
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error){
            // console.log(error);
            assert(error.hijackedStack.indexOf('revert' >= 0, 'the users other than admin cannot call this function.'))
            // End sale as admin.
            return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold DappToken to admin');
            // Check that token price was reset then selfDestruct was called
            return tokenSaleInstance.tokenPrice;
        }).then(function(price) {
            // Check that the contract has no balance
            // balance = web3.eth.getBalance(tokenSaleInstance.address)
            // assert.equal(balance.toNumber(), 0);
        })

    });
});