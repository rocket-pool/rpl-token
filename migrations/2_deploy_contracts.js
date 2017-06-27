// Contract
var rocketDepositToken = artifacts.require("./RocketPoolToken.sol");
// Libs
var arithmeticLib = artifacts.require("./lib/Arithmetic.sol");
// Get our network crowdsale config - can exist in diff locations if doing unit tests vs deploying
var options = !artifacts.resolver.options ? artifacts.resolver.resolver.options : artifacts.resolver.options;
var crowdsale = options.network_config.crowdsale;
var network = options.network;

//console.log(artifacts.resolver.options.network);

// Deploy now
module.exports = function(deployer) {
  deployer.deploy(arithmeticLib);
  deployer.link(arithmeticLib, rocketDepositToken);
  deployer.deploy(rocketDepositToken,
      crowdsale.targetEth,
      crowdsale.maxEthAllocation,
      crowdsale.depositAddress,
      crowdsale.fundingStartBlock,
      crowdsale.fundingEndBlock,
      crowdsale.txGasLimit
  );
};
