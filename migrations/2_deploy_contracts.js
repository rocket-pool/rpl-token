// Contracts
var rocketPoolToken = artifacts.require("./RocketPoolToken.sol");
var rocketPoolCrowdsale = artifacts.require("./RocketPoolCrowdsale.sol");
var rocketPoolPresale = artifacts.require("./RocketPoolPresale.sol");

// Libs
var arithmeticLib = artifacts.require("./lib/Arithmetic.sol");

// Get our network crowdsale config - can exist in diff locations if doing unit tests vs deploying
var options = !artifacts.resolver.options ? artifacts.resolver.resolver.options : artifacts.resolver.options;
var tokenSettings = options.network_config.token;
var crowdsaleSettings = options.network_config.crowdsale;
var network = options.network;

// If we are on local, the depositAddress is the coinbase
tokenSettings.depositAddress = network == 'development' ? web3.eth.coinbase : tokenSettings.depositAddress;

//console.log(tokenSettings);
//console.log(crowdsaleSettings);

// Deploy now
module.exports = function(deployer) {
  // Setup libs
  deployer.deploy(arithmeticLib);
  // Link libs
  deployer.link(arithmeticLib, [rocketPoolCrowdsale]);
  // Deploy Rocket Pool token first
  deployer.deploy(rocketPoolToken, tokenSettings.depositAddress).then(function () {
      // Deploy the crowdsale contract
      return deployer.deploy(rocketPoolCrowdsale,
          tokenSettings.depositAddress,
          crowdsaleSettings.targetEth,
          crowdsaleSettings.maxEthAllocation,
          crowdsaleSettings.fundingStartBlock,
          crowdsaleSettings.fundingEndBlock
      );
  });
};
