App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1e16,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function(){
        console.log("App initialized...");
        return App.initWeb3();
    },
    initWeb3: function() {
        if(typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Metamask
            App.web3Provider = web3.currentProvider;
            // web3 = new Web3(App.web3Provider);
            web3 = new Web3(ethereum);
            ethereum.enable();

        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("DappTokenSale.json", function(dappTokenSale) {
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            App.contracts.DappTokenSale.setProvider(App.web3Provider);
            App.contracts.DappTokenSale.deployed().then(function(dappTokenSale) {
                console.log("Dapp Token Sale Address:", dappTokenSale.address);
            });
        }).done(function() {
            $.getJSON("DappToken.json", function(dappToken) {
                App.contracts.DappToken = TruffleContract(dappToken);
                App.contracts.DappToken.setProvider(App.web3Provider);
                App.contracts.DappToken.deployed().then(function(dappToken) {
                    console.log("DappToken Address:", dappToken.address);
                });

                App.listenForEvents();
                return App.render();
            })
        })
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            instance.Sell({},{
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event) {
                console.log("event triggered ", event);
                App.render();
            })
        })
    },




    render: function() {
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                console.log("account -->", account);
                App.account = account;
                $('#accountAddress').html("Your Account:" + account);
            }
        })
        // Load token sale contract
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            console.log("token price -->", tokenPrice);
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber()); // --> <span class="token-price"></span>
            return dappTokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            
            // Debug
            // App.tokensSold = 20000;

            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progressPercent = 100 * (App.tokensSold / App.tokensAvailable);
            $('#progress').css('width', progressPercent +'%');

            // Load token contract
            App.contracts.DappToken.deployed().then(function(instance) {
                dappTokenInstance = instance;
                return dappTokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.dapp-balance').html(balance.toNumber())
                App.loading = false;
                loader.hide();
                content.show();
            })
        })
    },

    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numberOfToken = $('#numberOfTokens').val();
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfToken, {
                from: App.account, 
                value: numberOfToken * App.tokenPrice,
                gas: 500000 // gas limit
            });
        }).then(function(result) {
            console.log("Tokens bought ...")
            $('form').trigger('reset') // reset the number of tokens in form
            $('#loader').hide();
            $('#content').show();
        })
    }
}

$(function() {
    $(window).load(function() {
        App.init();
    })
});