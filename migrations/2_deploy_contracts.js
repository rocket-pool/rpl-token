// Config
var config = require("../truffle.js");

// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolReserveFund = artifacts.require("./sales/RocketPoolReserveFund.sol");
let accounts = [];


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
    var reserveFundDepositAddress = network == 'development' ? accounts[0] : salesContractsSettings.reserveFund.depositAddress;
    // Deploy Rocket Pool token first
    await deployer.deploy(rocketPoolToken);
    // Deploy reserve fund contract next
    return deployer.deploy(rocketPoolReserveFund, rocketPoolToken.address).then(function () {
        // Set everything the main token contract needs now
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Register our sale agent contracts with the main token contract now
            console.log("\n");
            // Set the reserve fund contract
            return rocketPoolTokenInstance.setSaleAgentContract(
                rocketPoolReserveFund.address,
                'reserveFund',
                salesContractsSettings.reserveFund.targetEthMin,
                salesContractsSettings.reserveFund.targetEthMax,
                salesContractsSettings.reserveFund.tokensLimit,
                salesContractsSettings.reserveFund.minDeposit,
                salesContractsSettings.reserveFund.maxDeposit,
                salesContractsSettings.reserveFund.fundingStartBlock,
                salesContractsSettings.reserveFund.fundingEndBlock,
                reserveFundDepositAddress
            ).then(function () {
                console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Agent Contract - ReserveFund');
                console.log(rocketPoolReserveFund.address);
                console.log(salesContractsSettings.reserveFund);
            });
            
        });
    });
};
