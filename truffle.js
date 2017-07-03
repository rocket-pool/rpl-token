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
        // The sale contractstruffl
        salesContracts: {
            // Type of contract ie presale, crowdsale, quarterly 
            'reserveFund': {
                // What the sale is aiming for 
                targetEth: 0,
                 // Maximum tokens the contract can distribute - this is our reserve fund
                maxTokens: units.convert('7500000', 'ether', 'wei'), // 7.5 million - 15%
                // Start block
                fundingStartBlock: 0,
                // End block
                fundingEndBlock: 9999999999,
                // Max ether allowed per account
                contributionLimit: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase',
                // Upgrading an existing sales contract here
                upgradeExistingContractAddress: 0
            },
            'crowdsale': {
                // What the sale is aiming for - 5 Ether
                targetEth: units.convert('5', 'ether', 'wei'),
                 // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                maxTokens: units.convert('20000000', 'ether', 'wei'), // 20 million
                // Start block
                fundingStartBlock: 5,
                // End block
                fundingEndBlock: 17,
                // Max ether allowed per account 2 Ether
                contributionLimit: units.convert('3', 'ether', 'wei'),
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase',
                // Upgrading an existing sales contract here
                upgradeExistingContractAddress: 0
            }
        }  
      },
    
  }
};
