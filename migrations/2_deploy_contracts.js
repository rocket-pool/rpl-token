// Contract
var rocketDepositToken = artifacts.require("./RocketPoolToken.sol");
// Libs
var arithmeticLib = artifacts.require("./lib/Arithmetic.sol");
// Get our network crowdsale config - can exist in diff locations if doing unit tests vs deploying
var options = !artifacts.resolver.options ? artifacts.resolver.resolver.options : artifacts.resolver.options;
var crowdsale = options.network_config.crowdsale;
var network = options.network;
// If we are on local, the depositAddress is the coinbase
crowdsale.depositAddress = network == 'development' ? web3.eth.coinbase : crowdsale.depositAddress;

// Deploy now
module.exports = function(deployer) {
  deployer.deploy(arithmeticLib);
  deployer.link(arithmeticLib, rocketDepositToken);
  deployer.deploy(rocketDepositToken,
      crowdsale.targetEth,
      crowdsale.maxEthAllocation,
      crowdsale.depositAddress,
      crowdsale.fundingStartBlock,
      crowdsale.fundingEndBlock
  );
};
