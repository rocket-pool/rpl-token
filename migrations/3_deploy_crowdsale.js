// Config
var config = require("../truffle.js");

// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolCrowdsale = artifacts.require("./sales/RocketPoolCrowdsale.sol");

// Libs
var safeMathLib = artifacts.require("./lib/SafeMath.sol");

// Deploy now
module.exports = function(deployer, network) {
        // Settings
        var salesContractsSettings = config.networks[network].salesContracts;
        // If we are on local, the depositAddress is the coinbase
        var crowdsaleDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.crowdsale.depositAddress;
        // Link libs
        deployer.link(safeMathLib, [rocketPoolCrowdsale]);
            // Deploy crowdsales contract next
            return deployer.deploy(rocketPoolCrowdsale, rocketPoolToken.address).then(function () {
                // Set everything the main token contract needs now
                return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
                    // Register our sale agent contracts with the main token contract now
                    console.log("\n");
                    // Set the crowdsale contract
                    rocketPoolTokenInstance.setSaleAgentContract(
                        rocketPoolCrowdsale.address,
                        'crowdsale',
                        salesContractsSettings.crowdsale.targetEthMin,
                        salesContractsSettings.crowdsale.targetEthMax,
                        salesContractsSettings.crowdsale.tokensLimit,
                        salesContractsSettings.crowdsale.minDeposit,
                        salesContractsSettings.crowdsale.maxDeposit,
                        salesContractsSettings.crowdsale.fundingStartBlock,
                        salesContractsSettings.crowdsale.fundingEndBlock,
                        crowdsaleDepositAddress
                        , { from: web3.eth.coinbase }
                    );
                    console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Agent Contract - Crowdsale 1');
                    console.log(rocketPoolCrowdsale.address);
                    console.log("\n");
                });  
        });
};

