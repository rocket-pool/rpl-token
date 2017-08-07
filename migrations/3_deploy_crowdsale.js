// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolCrowdsale = artifacts.require("./sales/RocketPoolCrowdsale.sol");

// Libs
var arithmeticLib = artifacts.require("./lib/Arithmetic.sol");
var safeMathLib = artifacts.require("./lib/SafeMath.sol");

// Get our network config - can exist in diff locations if doing unit tests vs deploying
var options = !artifacts.resolver.options ? artifacts.resolver.resolver.options : artifacts.resolver.options;
var tokenSettings = options.network_config.token;
var salesContractsSettings = options.network_config.salesContracts;
var network = options.network;

// If we are on local, the depositAddress is the coinbase
var crowdsaleDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.crowdsale.depositAddress;


// Deploy now
module.exports = function(deployer, network) {
        // Link libs
        deployer.link(arithmeticLib, [rocketPoolCrowdsale]);
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

