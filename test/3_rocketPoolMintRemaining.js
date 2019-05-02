// Load contracts
var rocketPoolToken = artifacts.require("./contract/RocketPoolToken.sol");
var rocketPoolMintRemaining = artifacts.require("./contract/RocketPoolMintRemaining.sol");

// Show events
var displayEvents = false;

// Display events triggered during the tests
if(displayEvents) {
    rocketPoolMintRemaining.deployed().then(function (rocketPoolMintRemainingInstance) {
        var eventWatch = rocketPoolMintRemainingInstance.allEvents({
            fromBlock: 0,
            toBlock: 'latest',
        }).watch(function (error, result) {
            // Print the event to console
            var printEvent = function(type, result, colour) {
                console.log("\n");
                console.log(colour, '*** '+type.toUpperCase()+' EVENT: ' + result.event + ' *******************************');
                console.log("\n");
                console.log(result.args);
                console.log("\n");
            }
            // This will catch all events, regardless of how they originated.
            if (error == null) {
                // Print the event
                printEvent('rocket', result, '\x1b[33m%s\x1b[0m:');
            }
        });
    });
}

// Print nice titles for each unit test
var printTitle = function(user, desc) {
    return '\x1b[33m'+user+'\033[00m\: \033[01;34m'+desc;
}

// Checks to see if a throw was triggered
var checkThrow = function (error) {
    if(error.toString().indexOf("VM Exception") == -1) {
        // Didn't throw like we expected
        return assert(false, error.toString());
    } 
    // Always show out of gas errors
    if(error.toString().indexOf("out of gas") != -1) {
        return assert(false, error.toString());
    }
}


// Start the token and agent tests now
contract('RocketPoolMintRemaining', function (accounts) {


    /*** Params / Settings ***********************************/        

    // Set our units
    var exponent = 0;
    var totalSupply = 0;
    var totalSupplyCap = 0;

    // Set our crowdsale addresses
    var depositAddress = 0;

    // Our contributers    
    var owner = accounts[0];
    var userFirst = accounts[1];
    var userSecond = accounts[2];
    var userThird = accounts[3];
    var userFourth = accounts[4];
    var userFifth = accounts[5];

    // Our sales contracts
    var saleContracts = {
        // Type of contract ie presale, crowdsale, quarterly 
        'mintRemaining': {
            // The min amount to raise to consider the sale a success
            targetEthMin: 0,
            // The max amount the sale agent can raise
            targetEthMax: 0,
            // Maximum tokens the contract can distribute 
            tokensLimit: 0,
            // Min ether allowed per deposit
            minDeposit: 0,
            // Max ether allowed per deposit
            maxDeposit: 0,
            // Start block
            fundingStartBlock: 0,
            // End block
            fundingEndBlock: 0,
            // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
            depositAddress: 0
        }
    }

    // Load our token contract settings
    it(printTitle('contractToken', 'load token contract settings'), function () {
        // Crowdsale contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Set the exponent
            return rocketPoolTokenInstance.exponent.call().then(function(result) {
                exponent = result.valueOf();
                // Set the total supply currently in existance
                return rocketPoolTokenInstance.totalSupply.call().then(function(result) {
                    totalSupply = result.valueOf();
                    // Set the total supply cap
                    return rocketPoolTokenInstance.totalSupplyCap.call().then(function(result) {
                        totalSupplyCap = result.valueOf();
                        // console.log(exponent, totalSupply, totalSupplyMinted);
                    });
                });
            });
        });
    });    
      

    // Load our reserveFund contract settings
    it(printTitle('contractMintRemainig', 'load mint remaining contract settings'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // reserveFund contract   
            return rocketPoolMintRemaining.deployed().then(function (rocketPoolMintRemainingInstance) {
                // Get the contract details
                return rocketPoolTokenInstance.getSaleContractTargetEtherMin.call(rocketPoolMintRemainingInstance.address).then(function(result) {
                    saleContracts.mintRemaining.targetEthMin = result.valueOf();
                    return rocketPoolTokenInstance.getSaleContractTargetEtherMax.call(rocketPoolMintRemainingInstance.address).then(function(result) {
                        saleContracts.mintRemaining.targetEthMax = result.valueOf();
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolMintRemainingInstance.address).then(function(result) {
                            saleContracts.mintRemaining.tokensLimit = result.valueOf();
                            return rocketPoolTokenInstance.getSaleContractStartBlock.call(rocketPoolMintRemainingInstance.address).then(function(result) {
                                saleContracts.mintRemaining.fundingStartBlock = result.valueOf();
                                return rocketPoolTokenInstance.getSaleContractEndBlock.call(rocketPoolMintRemainingInstance.address).then(function(result) {
                                    saleContracts.mintRemaining.fundingEndBlock = result.valueOf();
                                    return rocketPoolTokenInstance.getSaleContractDepositEtherMin.call(rocketPoolMintRemainingInstance.address).then(function(result) {
                                        saleContracts.mintRemaining.minDeposit = result.valueOf();
                                        return rocketPoolTokenInstance.getSaleContractDepositEtherMax.call(rocketPoolMintRemainingInstance.address).then(function (result) {
                                            saleContracts.mintRemaining.maxDeposit = result.valueOf();
                                            return rocketPoolTokenInstance.getSaleContractDepositAddress.call(rocketPoolMintRemainingInstance.address).then(function (result) {
                                                saleContracts.mintRemaining.depositAddress = result.valueOf();
                                                return saleContracts.mintRemaining.depositAddress != 0 ? true : false;
                                            }).then(function (result) {
                                                assert.isTrue(result, "rocketPoolMintRemainingInstance depositAddress verified.");
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }); 




    /*** Tests Start ***********************************/    

    it(printTitle('depositAddress', 'fail to retrieve remaining tokens without verifying depositAddress with sale agent'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolMintRemaining.deployed().then(function (rocketPoolMintRemainingInstance) {
                // Get the contract details
                return rocketPoolMintRemainingInstance.claimRemainingRPL({ from: saleContracts.mintRemaining.depositAddress, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function(result) { 
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    });


    
    it(printTitle('depositAddress', 'verify depositAddress with sale agent'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolMintRemaining.deployed().then(function (rocketPoolMintRemainingInstance) {
                // Get the contract details
                return rocketPoolMintRemainingInstance.setDepositAddressVerify({ from: saleContracts.mintRemaining.depositAddress, gas: 250000 }).then(function (result) {
                    // Token contract, verify our reservefund contract has been verified   
                    return rocketPoolTokenInstance.getSaleContractDepositAddressVerified.call(rocketPoolMintRemainingInstance.address, { from: owner }).then(function (result) {
                        var verified = result.valueOf();
                        return verified == true;
                    }).then(function (result) {
                        assert.isTrue(result, "rocketPoolMintRemainingInstance depositAddress verified.");
                    });    
                });
            });
        });
    }); 

    
    
    it(printTitle('userFirst', 'fails to retrieve tokens from mintRemaining sale agent'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolMintRemaining.deployed().then(function (rocketPoolMintRemainingInstance) {
                // Get the contract details
                return rocketPoolMintRemainingInstance.claimRemainingRPL({ from: userFirst, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function(result) { 
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); 

  
    it(printTitle('depositAddress', 'retrieve remaining tokens from sale agent'), function () {
          // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolMintRemaining.deployed().then(function (rocketPoolMintRemainingInstance) {
                 // Token contract   
                 return rocketPoolTokenInstance.getRemainingTokens.call().then(function (result) {
                     // Get our token balance now
                    var remainingTokenBalance = parseFloat(result.valueOf());
                       // Get the contract details
                    return rocketPoolMintRemainingInstance.claimRemainingRPL({ from: saleContracts.mintRemaining.depositAddress, gas: 350000 }).then(function (result) {
                        // Token contract   
                        return rocketPoolTokenInstance.balanceOf.call(saleContracts.mintRemaining.depositAddress).then(function (result) {
                            // Get our token balance now
                            var tokenBalance = parseFloat(result.valueOf());
                            // Get the total supply cap
                            return rocketPoolTokenInstance.totalSupplyCap.call().then(function (result) {
                                totalSupplyCap = parseFloat(result.valueOf());
                                // Get the total supply minted
                                return rocketPoolTokenInstance.totalSupply.call().then(function (result) {
                                    console.log(web3.utils.fromWei(''+result.valueOf(), 'ether'));
                                    totalSupply = parseFloat(result.valueOf());
                                    // Get the total tokens minted according to the sale agent
                                    return rocketPoolTokenInstance.getSaleContractTokensMinted.call(rocketPoolMintRemainingInstance.address).then(function (result) {
                                        // Total minted by sale agent
                                        var totalMintedSaleAgent = parseFloat(result.valueOf());
                                        console.log(web3.utils.fromWei(''+result.valueOf(), 'ether'));
                                        //console.log(tokenBalance, totalSupply, totalSupplyCap, totalMintedSaleAgent, tokenBalance);
                                        return  totalSupply == totalSupplyCap &&
                                                totalMintedSaleAgent == tokenBalance
                                            ? true : false;
                                    }).then(function (result) {
                                        assert.isTrue(result, "Tokens sent to depositAddress.");
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });   

  
    it(printTitle('owner/depositAddress', 'fails to mint anymore tokens from sale agent again'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolMintRemaining.deployed().then(function (rocketPoolMintRemainingInstance) {
                // Get the contract details
                return rocketPoolMintRemainingInstance.claimRemainingRPL({ from: owner, gas: 350000 }).then(function (result) {
                    return result;
                }).then(function(result) { 
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); 
   
});



 


