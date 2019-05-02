// Config
var config = require("../truffle.js");

// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolMintRemaining = artifacts.require("./sales/RocketPoolMintRemaining.sol");


// Deploy now
module.exports = async (deployer, network) => {
        // GEt accounts
        accounts = await web3.eth.getAccounts(function(error, result) {
            if(error != null) {
            console.log(error);
            console.log("Error retrieving accounts.'");
            }
            return result;
        });
        // Settings
        var salesContractsSettings = config.networks[network].salesContracts;
        // If we are on local, the depositAddress is the coinbase
        var presaleDepositAddress = network == 'development' ? accounts[0] : salesContractsSettings.mintremaining.depositAddress;
        // Deploy presale contract next
        return deployer.deploy(rocketPoolMintRemaining, rocketPoolToken.address).then(function () {
            // Set everything the main token contract needs now
            return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
                // Register our sale agent contracts with the main token contract now
                console.log("\n");
                 // Set the presale contract
                 rocketPoolTokenInstance.setSaleAgentContract(
                    rocketPoolMintRemaining.address,
                    'presale',
                    salesContractsSettings.mintRemaining.targetEthMin,
                    salesContractsSettings.mintRemaining.targetEthMax,
                    salesContractsSettings.mintRemaining.tokensLimit,
                    salesContractsSettings.mintRemaining.minDeposit,
                    salesContractsSettings.mintRemaining.maxDeposit,
                    salesContractsSettings.mintRemaining.fundingStartBlock,
                    salesContractsSettings.mintRemaining.fundingEndBlock,
                    presaleDepositAddress
                );
                console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Agent Contract - Mint Remaining');
                console.log(rocketPoolMintRemaining.address);
                console.log("\n");
            });  
        });
};

