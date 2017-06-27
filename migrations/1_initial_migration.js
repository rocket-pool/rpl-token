var Migrations = artifacts.require("./base/Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
