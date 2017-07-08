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
            'reserveFund': {
                // What the sale is aiming for 
                targetEth: 0,
                 // Maximum tokens the contract can distribute - this is our reserve fund
                tokensLimit: units.convert('7500000', 'ether', 'wei'), // 7.5 million - 15%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: 0,
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Max ether allowed per account
                contributionLimit: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase'
            },
            'presale': {
                // What the sale is aiming for - 5 Ether
                targetEth: units.convert('5', 'ether', 'wei'),
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('10625000', 'ether', 'wei'), // 10,625,000 - 25%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('4000', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Max ether allowed per account
                contributionLimit: units.convert('4000', 'ether', 'wei'),
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase'
            },
            'crowdsale': {
                // What the sale is aiming for - 5 Ether
                targetEth: units.convert('5', 'ether', 'wei'),
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('20000000', 'ether', 'wei'), // 20 million
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('4', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 8,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 57,
                // Max ether allowed per account 2 Ether
                contributionLimit: units.convert('3', 'ether', 'wei'),
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase'
            }
        }  
      },
    
  }
};
