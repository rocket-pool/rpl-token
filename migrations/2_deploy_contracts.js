// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolReserveFund = artifacts.require("./sales/RocketPoolReserveFund.sol");
//var rocketPoolCrowdsale = artifacts.require("./sales/RocketPoolCrowdsale.sol");

// Libs
var arithmeticLib = artifacts.require("./lib/Arithmetic.sol");

// Get our network crowdsale config - can exist in diff locations if doing unit tests vs deploying
var options = !artifacts.resolver.options ? artifacts.resolver.resolver.options : artifacts.resolver.options;
var tokenSettings = options.network_config.token;
var salesContractsSettings = options.network_config.salesContracts;
var network = options.network;

// If we are on local, the depositAddress is the coinbase
var reserveFundDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.reserveFund.depositAddress;
var crowdsaleDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.crowdsale.depositAddress;


// Deploy now
module.exports = function(deployer) {
  // Setup libs
  deployer.deploy(arithmeticLib);
  // Link libs
  deployer.link(arithmeticLib, [rocketPoolToken]);
  // Deploy Rocket Pool token first
  deployer.deploy(rocketPoolToken).then(function () {
    // Deploy reserve fund contract next
      return deployer.deploy(rocketPoolReserveFund).then(function () {
          // Deploy crowdsales contract next
          /*
          return deployer.deploy(rocketPoolCrowdsale, rocketPoolToken.address).then(function () {
              // Set everything the main token contract needs now
              
              return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
                  // Register our sale agent contracts with the main token contract now
                  console.log("\n");
                  // Set the reserve fund contract
                  rocketPoolTokenInstance.setSaleContract(
                      rocketPoolReserveFund.address,
                      'reserveFund',
                      salesContractsSettings.reserveFund.targetEth,
                      salesContractsSettings.reserveFund.maxTokens,
                      salesContractsSettings.reserveFund.fundingStartBlock,
                      salesContractsSettings.reserveFund.fundingEndBlock,
                      salesContractsSettings.reserveFund.contributionLimit,
                      reserveFundDepositAddress,
                      salesContractsSettings.crowdsale.upgradeExistingContractAddress
                  );
                  console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Contract - Crowdsale');
                  console.log(rocketPoolCrowdsale.address);
                  console.log("\n");
                  // Set the crowdsale contract
                  rocketPoolTokenInstance.setSaleContract(
                      rocketPoolCrowdsale.address,
                      'crowdsale',
                      salesContractsSettings.crowdsale.targetEth,
                      salesContractsSettings.crowdsale.maxTokens,
                      salesContractsSettings.crowdsale.fundingStartBlock,
                      salesContractsSettings.crowdsale.fundingEndBlock,
                      salesContractsSettings.crowdsale.contributionLimit,
                      crowdsaleDepositAddress,
                      salesContractsSettings.crowdsale.upgradeExistingContractAddress
                  );
                  console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Contract - Crowdsale');
                  console.log(rocketPoolCrowdsale.address);
              });
              
          });*/
      });
  });
};
