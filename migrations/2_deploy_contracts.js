// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolCrowdsale = artifacts.require("./sales/RocketPoolCrowdsale.sol");

// Libs
var arithmeticLib = artifacts.require("./lib/Arithmetic.sol");

// Get our network crowdsale config - can exist in diff locations if doing unit tests vs deploying
var options = !artifacts.resolver.options ? artifacts.resolver.resolver.options : artifacts.resolver.options;
var tokenSettings = options.network_config.token;
var salesContractsSettings = options.network_config.salesContracts;
var network = options.network;

// If we are on local, the depositAddress is the coinbase
var crowdsaleDepositAddress = network == 'development' ? web3.eth.coinbase : salesContractsSettings.crowdsale.depositAddress;


//console.log(tokenSettings);
//console.log(crowdsaleSettings);

// Deploy now
module.exports = function(deployer) {
  // Setup libs
  deployer.deploy(arithmeticLib);
  // Link libs
  deployer.link(arithmeticLib, [rocketPoolToken, rocketPoolCrowdsale]);
  // Deploy Rocket Pool token first
  deployer.deploy(rocketPoolToken).then(function () {
    // Deploy crowdsales contract next
    return deployer.deploy(rocketPoolCrowdsale, rocketPoolToken.address).then(function () {
        // Set everything the main token contract needs now
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            console.log("\n");
            // Set the crowdsale contract
            rocketPoolTokenInstance.setSaleContract(
                rocketPoolCrowdsale.address,
                'crowdsale',
                salesContractsSettings.crowdsale.targetEth,
                salesContractsSettings.crowdsale.contributionLimit,
                salesContractsSettings.crowdsale.fundingStartBlock,
                salesContractsSettings.crowdsale.fundingEndBlock,
                crowdsaleDepositAddress,
                salesContractsSettings.crowdsale.upgradeExistingContractAddress
            );
            console.log('\x1b[33m%s\x1b[0m:', 'Added New Sales Contract - Crowdsale');
            console.log(rocketPoolCrowdsale.address);
        });
    });
  });
};
