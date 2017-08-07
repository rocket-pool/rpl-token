// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolReserveFund = artifacts.require("./sales/RocketPoolReserveFund.sol");
var rocketPoolPresale = artifacts.require("./sales/RocketPoolPresale.sol");

// Libs
var safeMathLib = artifacts.require("./lib/SafeMath.sol");

// Get our network config - can exist in diff locations if doing unit tests vs deploying
var options = !artifacts.resolver.options ? artifacts.resolver.resolver.options : artifacts.resolver.options;
var tokenSettings = options.network_config.token;
var salesContractsSettings = options.network_config.salesContracts;
var network = options.network;

// If we are on local, the depositAddress is the coinbase
var reserveFundDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.reserveFund.depositAddress;
var presaleDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.presale.depositAddress;


// Deploy now
module.exports = function(deployer) {
  // Setup libs
  deployer.deploy([safeMathLib]);
  // Link libs
  deployer.link(safeMathLib, [rocketPoolToken, rocketPoolPresale]);
  // Deploy Rocket Pool token first
  deployer.deploy(rocketPoolToken).then(function () {
      // Deploy reserve fund contract next
       return deployer.deploy(rocketPoolReserveFund, rocketPoolToken.address).then(function () {
          // Deploy presale contract next
          return deployer.deploy(rocketPoolPresale, rocketPoolToken.address).then(function () {
            // Set everything the main token contract needs now
            return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
                // Register our sale agent contracts with the main token contract now
                console.log("\n");
                // Set the reserve fund contract
                rocketPoolTokenInstance.setSaleAgentContract(
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
                    , { from: web3.eth.coinbase }
                );
                console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Agent Contract - ReserveFund');
                console.log(rocketPoolReserveFund.address);
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
                    , { from: web3.eth.coinbase }
                );
                console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Agent Contract - Presale');
                console.log(rocketPoolPresale.address);
                console.log("\n");
            });
        });
      });
  });
};
