#!/usr/bin/env node

// Requirements
var units = require('ethereumjs-units');


module.exports = {
  networks: {
    development: {
        host: "localhost",
        port: 8545,
        network_id: "*", // Match any network id,
        // The token parameters  
        token: {
            // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
            depositAddress: 0,
        },  
        // The sale contracts
        salesContracts: {
            // Type of contract ie presale, crowdsale, quarterly 
            'crowdsale': {
                // What the sale is aiming for - 5 Ether
                targetEth: units.convert('5', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 5,
                // End block
                fundingEndBlock: 17,
                // Max ether allowed per account 2 Ether
                contributionLimit: units.convert('3', 'ether', 'wei'),
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 0,
                // Upgrading an existing sales contract here
                upgradeExistingContractAddress: 0
            }
        }  
      },
    
  }
};
