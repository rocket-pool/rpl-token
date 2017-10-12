#!/usr/bin/env node

// Requirements
var units = require('ethereumjs-units');

// Live Start/End Blocks
// Start: 4296500 - EST SAT SEP 09 2017 09:02:41 Brisbane 
// End: 4382800 - EST SAT SEP 23 2017 08:39:25 Brisbane
// Live deploy parity - parity --jsonrpc-cors http://localhost --geth --force-ui --reseal-min-period 0


module.exports = {
  networks: {
    development: {
        host: "localhost",
        port: 8545,
        network_id: "*", // Match any network id,
        // The sale contracts
        salesContracts: {
            // This is the reserve fund contract, simply distributes the reserved coins to the depositAddress
            'reserveFund': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: 0,
                 // Maximum tokens the contract can distribute - this is our reserve fund
                tokensLimit: units.convert('2700000', 'ether', 'wei'), // 2,700,000 - 15%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: 0,
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase'
            },
            // This is a presale with preset addresses assigned certain amounts of coins which they can collect. Sale is over when the fundingEndBlock hits and depositAddress finalises the sale.
            'presale': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: units.convert('6442', 'ether', 'wei'),
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('9000000', 'ether', 'wei'), // 9,000,000 - 50%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('6442', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase'
            },
            // This is a proportionally distributed crowdsale, when the targetEthMin is met, the sale is considered a success and users can collect their tokens + refund.
            // Estimate 18sec blocks including uncles, brings us too 4,800 blocks per day
            'crowdsale': {
                // The min amount to raise to consider the sale a success
                targetEthMin: units.convert('5', 'ether', 'wei'), // 5,846
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: units.convert('30000', 'ether', 'wei'), // 30,000
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('7088000', 'ether', 'wei'), // 7,088,000 - ~40%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('2', 'ether', 'wei'), // 1000
                // Start block
                fundingStartBlock: 15,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 26,    // = fundingStartBlock + 144,000 = est 4,800 blocks per day x 30 days
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: 'testrpccoinbase'
            }
        }  
      },
    // Testnet - Dev
    dev: {
        host: "localhost",
        port: 8545,
        network_id: "*", // Dev
        from: "0xFFBFFe2a8926Cc1dD4fF307961e99E9a2586a698",
        // The sale contracts
        salesContracts: {
            // This is the reserve fund contract, simply distributes the reserved coins to the depositAddress
            'reserveFund': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: 0,
                // Maximum tokens the contract can distribute - this is our reserve fund
                tokensLimit: units.convert('2700000', 'ether', 'wei'), // 2,700,000 - 15%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: 0,
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: '0x4E3bc0DC25C42Ed2745BFc67F1d0DAa52103C01A'
            },
            // This is a presale with preset addresses assigned certain amounts of coins which they can collect. Sale is over when the fundingEndBlock hits and depositAddress finalises the sale.
            'presale': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: units.convert('6442', 'ether', 'wei'),
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('9000000', 'ether', 'wei'), // 9,000,000 - 50%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('6442', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: '0x4E3bc0DC25C42Ed2745BFc67F1d0DAa52103C01A'
            }
        }  
      },
    // Testnet - Kovan
    kovan: {
        host: "localhost",
        port: 8545,
        network_id: "42", // Kovan
        from: "0xFFBFFe2a8926Cc1dD4fF307961e99E9a2586a698",
        // The sale contracts
        salesContracts: {
            // This is the reserve fund contract, simply distributes the reserved coins to the depositAddress
            'reserveFund': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: 0,
                // Maximum tokens the contract can distribute - this is our reserve fund
                tokensLimit: units.convert('2700000', 'ether', 'wei'), // 2,700,000 - 15%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: 0,
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: '0x4E3bc0DC25C42Ed2745BFc67F1d0DAa52103C01A'
            },
            // This is a presale with preset addresses assigned certain amounts of coins which they can collect. Sale is over when the fundingEndBlock hits and depositAddress finalises the sale.
            'presale': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: units.convert('6442', 'ether', 'wei'),
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('9000000', 'ether', 'wei'), // 9,000,000 - 50%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('6442', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: '0x4E3bc0DC25C42Ed2745BFc67F1d0DAa52103C01A'
            }
        }  
      },
    // Live - Mainnet
    live: {
        host: "localhost",
        port: 8545,
        network_id: "1", // Live
        from: "0xFFBFFe2a8926Cc1dD4fF307961e99E9a2586a698",
        // The sale contracts
        salesContracts: {
            // This is the reserve fund contract, simply distributes the reserved coins to the depositAddress
            'reserveFund': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: 0,
                // Maximum tokens the contract can distribute - this is our reserve fund
                tokensLimit: units.convert('2700000', 'ether', 'wei'), // 2,700,000 - 15%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: 0,
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: '0x4E3bc0DC25C42Ed2745BFc67F1d0DAa52103C01A'
            },
            // This is a presale with preset addresses assigned certain amounts of coins which they can collect. Sale is over when the fundingEndBlock hits and depositAddress finalises the sale.
            'presale': {
                // The min amount to raise to consider the sale a success
                targetEthMin: 0,
                // The max amount the sale agent can raise, will stop accepting contributions at this point
                targetEthMax: units.convert('6442', 'ether', 'wei'),
                // Maximum tokens the contract can distribute, setting to 0 will assign it all available tokens 
                tokensLimit: units.convert('9000000', 'ether', 'wei'), // 9,000,000 - 50%
                // What the minimum deposit amount allowed
                minDeposit: 0,
                // What is the maximum deposit size allowed
                maxDeposit: units.convert('6442', 'ether', 'wei'),
                // Start block
                fundingStartBlock: 0,
                // End block, If the end block is set to 0, the sale continues until supply runs out or its finalised
                fundingEndBlock: 0,
                // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
                depositAddress: '0x4E3bc0DC25C42Ed2745BFc67F1d0DAa52103C01A'
            }
        }  
      },
  }
};
