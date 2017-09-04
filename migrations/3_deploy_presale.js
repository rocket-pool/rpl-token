// Config
var config = require("../truffle.js");

// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolPresale = artifacts.require("./sales/RocketPoolPresale.sol");


// Deploy now
module.exports = function(deployer, network) {
        // Settings
        var salesContractsSettings = config.networks[network].salesContracts;
        // If we are on local, the depositAddress is the coinbase
        var presaleDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.presale.depositAddress;
        // Deploy presale contract next
        return deployer.deploy(rocketPoolPresale, rocketPoolToken.address).then(function () {
            // Set everything the main token contract needs now
            return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
                // Register our sale agent contracts with the main token contract now
                console.log("\n");
                 // Set the presale contract
                 rocketPoolTokenInstance.setSaleAgentContract(
                    rocketPoolPresale.address,
                    'presale',
                    salesContractsSettings.presale.targetEthMin,
                    salesContractsSettings.presale.targetEthMax,
                    salesContractsSettings.presale.tokensLimit,
                    salesContractsSettings.presale.minDeposit,
                    salesContractsSettings.presale.maxDeposit,
                    salesContractsSettings.presale.fundingStartBlock,
                    salesContractsSettings.presale.fundingEndBlock,
                    presaleDepositAddress
                );
                console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Agent Contract - Presale');
                console.log(rocketPoolPresale.address);
                console.log("\n");
            });  
        });
};

