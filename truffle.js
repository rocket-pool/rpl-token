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
            // This is the reserve fund contract, simply distributes the reserved coins to the depositAddress
            'reserveFund': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: 0,
                 // Maximum tokens the contract can distribute - this is our reserve fund
                tokensLimit: units.convert('7500000', 'ether', 'wei'), // 7,500,000 - 15%
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
            // This is a presale with preset addresses assigned certain amounts of coins which they can collect. Sale is over when the fundingEndBlock hits and depositAddress finalises the sale.
            'presale': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: units.convert('4000', 'ether', 'wei'),
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('12500000', 'ether', 'wei'), // 12,500,000 - 25%
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
            // This is a proportionally distributed crowdsale, when the targetEthMin is met, the sale is considered a success and users can collect their tokens + refund.
            'crowdsale': {
                // The min amount to raise to consider the sale a success
                targetEthMin: units.convert('5', 'ether', 'wei'), // 5,000
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: units.convert('10000', 'ether', 'wei'), // 10,000
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('30000000', 'ether', 'wei'), // 30,000,000 - 60%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('4', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 15,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 26,
                // Max ether allowed per account 2 Ether
                contributionLimit: units.convert('3', 'ether', 'wei'),
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase'
            }
        }  
      },
    
  }
};
