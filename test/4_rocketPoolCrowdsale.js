// Load contracts
var rocketPoolToken = artifacts.require("./contract/RocketPoolToken.sol");
var rocketPoolCrowdsale = artifacts.require("./contract/RocketPoolCrowdsale.sol");

// Show events
var displayEvents = false;

// Display events triggered during the tests
if(displayEvents) {
    rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
        var eventWatch = rocketPoolCrowdsaleInstance.allEvents({
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


// Start the token and crowdsale tests now
contract('rocketPoolCrowdsale', function (accounts) {

    // Set our crowdsale units
    var exponent = 0;
    var totalSupply = 0;
    var totalSupplyCap = 0;
    // Token price for crowdsale is calculated as maxTargetEth / tokensLimit
    var tokenPriceInEther = 0;

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
        // Type of contract ie crowdsale, crowdsale, quarterly 
        'crowdsale': {
            // The min amount to raise to consider the sale a success
            targetEthMin: 0,
            // The max amount the sale agent can raise
            targetEthMax: 0,
            // Maximum tokens the contract can distribute 
            tokensLimit: 0,
            // Max ether allowed per account
            contributionLimit: 0,
            // Start block
            fundingStartBlock: 0,
            // End block
            fundingEndBlock: 0,
            // Deposit address that will be allowed to withdraw the crowdsales ether - this is overwritten with the coinbase address for testing here
            depositAddress: 0,
        }
    }

    
    // Load our token contract settings
    it(printTitle('contractToken', 'load token contract settings'), function () {
        // crowdsale contract   
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
                    });
                });
            });
        });
    });    



    // Load our crowdsale contract settings
    it(printTitle('contractCrowdsale', 'load crowdsale contract settings'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the contract details
                return rocketPoolTokenInstance.getSaleContractTargetEtherMin.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                    saleContracts.crowdsale.targetEthMin = result.valueOf();
                    return rocketPoolTokenInstance.getSaleContractTargetEtherMax.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                        saleContracts.crowdsale.targetEthMax = result.valueOf();
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                            saleContracts.crowdsale.tokensLimit = result.valueOf();
                            return rocketPoolTokenInstance.getSaleContractStartBlock.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                                saleContracts.crowdsale.fundingStartBlock = result.valueOf();
                                return rocketPoolTokenInstance.getSaleContractEndBlock.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                                    saleContracts.crowdsale.fundingEndBlock = result.valueOf();
                                    return rocketPoolTokenInstance.getSaleContractContributionLimit.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                                        saleContracts.crowdsale.contributionLimit = result.valueOf();
                                        return rocketPoolTokenInstance.getSaleContractDepositAddress.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                                            saleContracts.crowdsale.depositAddress = result.valueOf();
                                            // Set the token price in ether now - maxTargetEth / tokensLimit
                                            tokenPriceInEther = saleContracts.crowdsale.targetEthMax / saleContracts.crowdsale.tokensLimit;
                                            return saleContracts.crowdsale.depositAddress != 0 ? true : false;
                                        }).then(function (result) {
                                            assert.isTrue(result, "rocketPoolCrowdsaleInstance depositAddress verified.");
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

    it(printTitle('userFirst', 'fail to deposit without depositAddress being verified with sale agent'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount = 1 ether
                var sendAmount = web3.toWei('1', 'ether');
                // Get the contract details
                return rocketPoolCrowdsaleInstance.createTokens({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
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
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the contract details
                return rocketPoolCrowdsaleInstance.setDepositAddressVerify({ from: saleContracts.crowdsale.depositAddress, gas: 250000 }).then(function (result) {
                    // Token contract, verify our reservefund contract has been verified   
                    return rocketPoolTokenInstance.getSaleContractDepositAddressVerified.call(rocketPoolCrowdsaleInstance.address, { from: saleContracts.crowdsale.depositAddress }).then(function (result) {
                        var verified = result.valueOf();
                        return verified == true;
                    }).then(function (result) {
                        assert.isTrue(result, "rocketPoolCrowdsaleInstance depositAddress verified.");
                    });    
                });
            });
        });
    });       

    // Begin Tests
    /*
    it(printTitle('userFirst', 'fails to deposit before the crowdsale begins'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.createTokens({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test
    */

 

    // START BLOCK  should have been reached now for the start of the crowdfund

    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1', 'ether'); 
            // Transaction
            return rocketPoolCrowdsaleInstance.createTokens({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                });
            }).then(function (result) {
                assert.isTrue(result, "Contribution made successfully.");
            }); 
        });    
    }); // End Test 


    it(printTitle('userFirst', 'fails to deposit by sending more than the ContributionLimit will allow per account'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the max ether per account
                return rocketPoolTokenInstance.getSaleContractContributionLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Contribute amount = 1 ether more than allowed
                    var sendAmount = Number(result.valueOf()) + Number(web3.toWei('1', 'ether'));
                    // Transaction
                    return rocketPoolCrowdsaleInstance.createTokens({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        return result;
                    }).then(function (result) {
                        assert(false, "Expect throw but didn't.");
                    }).catch(function (error) {
                        return checkThrow(error);
                    });
                });
            });
        });
    }); // End Test    


    it(printTitle('despositAddress', 'fails to call finaliseFunding successfully while crowdsale is running'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the max ether per account
            return rocketPoolCrowdsaleInstance.finaliseFunding({ from: saleContracts.crowdsale.depositAddress, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                  return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });   
    }); // End Test   

    
    it(printTitle('userFirst', 'makes another successful deposit to max out their account contribution'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                    // His contrbutions so far
                    var userFirstContributionTotal = Number(result.valueOf());
                    // Get the max ether per account
                    return rocketPoolTokenInstance.getSaleContractContributionLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                        var maxEthAllocation = Number(result.valueOf());
                        // Contribute the exact amount needed to set it at the per account threshold
                        var sendAmount = maxEthAllocation - userFirstContributionTotal;
                        // Transaction
                        return rocketPoolCrowdsaleInstance.createTokens({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                            // Get the contribution balance of their account now
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                                return result.valueOf() == maxEthAllocation ? true : false;
                            }).then(function (result) {
                                assert.isTrue(result, "Contribution made successfully.");
                            });
                        });
                    });
                });
            });
        });    
    }); // End Test 

   
    it(printTitle('userFirst', 'fails to deposit using by adding to their deposit that than exceeds the ContributionLimit will allow per account'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = Number(web3.toWei('1', 'ether'));
                // Transaction
                return rocketPoolCrowdsaleInstance.createTokens({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        }); // End Test
    });


    it(printTitle('userSecond', 'deposits the ContributionLimit for their contribution'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the max ether per account
                return rocketPoolTokenInstance.getSaleContractContributionLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Contribute amount
                    var sendAmount = Number(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.createTokens({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        // Get the contribution balance of their account now
                        return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                            return result.valueOf() == sendAmount ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "Contribution made successfully.");
                        });
                    });
                });
            });
        });
    }); // End Test 
    

    it(printTitle('userThird', 'makes successful deposit to crowdsale of 1.33333945012327895 ether'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('1.33333945012327895', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.createTokens({ from: userThird, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userThird).then(function (result) {
                        return result.valueOf() == sendAmount ? true : false;
                    }).then(function (result) {
                        assert.isTrue(result, "Contribution made successfully.");
                    });
                });
            });
        });
    }); // End Test 

   
});



 


