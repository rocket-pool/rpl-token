#!/usr/bin/env node

// Requirements
var units = require('ethereumjs-units');


module.exports = {
  networks: {
    development: {
        host: "localhost",
        port: 8545,
        network_id: "*", // Match any network id,
        // The crowdsale parameters  
        crowdsale: {
            // What the crowdsale is aiming for - 5 Ether
            targetEth: units.convert('1', 'ether', 'wei'),
            // Max ether allowed per account 2 Ether
            maxEthAllocation: units.convert('2', 'ether', 'wei'),
            // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
            depositAddress: 0,
            // Start block
            fundingStartBlock: 5,
            // End block
            fundingEndBlock: 25,
            // Max allowed gas per contribution
            txGasLimit: 500000
        }  
      
      },
    
  }
};
