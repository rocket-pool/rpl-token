// NOTE: Before running, this script requires that testrpc be restarted so that the start block and end blocks required match up for the unit test

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
    var totalContributions = 0;

    // Set our crowdsale addresses
    var depositAddress = 0;

    // Our contributers    
    var owner = accounts[0];
    var userFirst = accounts[1];
    var userSecond = accounts[2];
    var userThird = accounts[3];
    var userFourth = accounts[4];
    var userFifth = accounts[5];
    var userSixth = accounts[6];

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
            // Min ether allowed per deposit
            minDeposit: 0,
            // Max ether allowed per deposit
            maxDeposit: 0,
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
                                    return rocketPoolTokenInstance.getSaleContractDepositEtherMin.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                                        saleContracts.crowdsale.minDeposit = result.valueOf();
                                        return rocketPoolTokenInstance.getSaleContractDepositEtherMax.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                                            saleContracts.crowdsale.maxDeposit = result.valueOf();
                                            return rocketPoolTokenInstance.getSaleContractDepositAddress.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                                                saleContracts.crowdsale.depositAddress = result.valueOf();
                                                // Set the token price in ether now - minTargetEth / tokensLimit
                                                tokenPriceInEther = saleContracts.crowdsale.targetEthMin / saleContracts.crowdsale.tokensLimit;
                                                // Log it
                                                console.log("\n");
                                                console.log(printTitle('Sale Agent Details', '--------------------------'));
                                                console.log("\n");
                                                console.log(printTitle(' Target Ether Min', web3.fromWei(saleContracts.crowdsale.targetEthMin, 'ether')));
                                                console.log(printTitle(' Target Ether Max', web3.fromWei(saleContracts.crowdsale.targetEthMax, 'ether')));
                                                console.log(printTitle(' Start Block', saleContracts.crowdsale.fundingStartBlock));
                                                console.log(printTitle(' End Block', saleContracts.crowdsale.fundingEndBlock));
                                                console.log(printTitle(' Min Deposit', web3.fromWei(saleContracts.crowdsale.minDeposit, 'ether')));
                                                console.log(printTitle(' Max Deposit', web3.fromWei(saleContracts.crowdsale.maxDeposit, 'ether')));
                                                console.log(printTitle(' Deposit Address', saleContracts.crowdsale.depositAddress));
                                                console.log(printTitle(' Token Price in Ether', tokenPriceInEther));
                                                console.log("\n");
                                                return saleContracts.crowdsale.depositAddress != 0 ? true : false;
                                            }).then(function (result) {
                                                assert.isTrue(result, "rocketPoolPresaleInstance depositAddress verified.");
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

    it(printTitle('userFirst', 'fail to deposit without depositAddress being verified with sale agent'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount = 1 ether
                var sendAmount = web3.toWei('1', 'ether');
                // Get the contract details
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
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

    it(printTitle('userFirst', 'fails to deposit before the crowdsale begins'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test
 

    // START BLOCK  should have been reached now for the start of the crowdfund

    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 



    it(printTitle('userSecond', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userSecond', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userSecond', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test


    it(printTitle('userSecond', 'makes successful deposit to crowdsale of 0.1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userSixth', 'makes successful deposit to crowdsale of 5 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = Number(web3.toWei('0.1', 'ether')); 
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSixth).then(function (result) {
                // Original contribution amount
                var contributionTotal = Number(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSixth, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userSixth).then(function (result) {
                        return result.valueOf() == contributionTotal + sendAmount ? true : false;
                    });
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 



    // END BLOCK HITS

     it(printTitle('userFourth', 'fails to make deposit to crowdsale of 0.1 ether as crowdsale end block is hit'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('0.1', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFourth, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test     

    
   it(printTitle('depositAddress', 'fails to finalise the crowdsale as the min target ether was not met'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Transaction
            return rocketPoolCrowdsaleInstance.finaliseFunding({ from: saleContracts.crowdsale.depositAddress, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                   return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
     }); // End Test 
    
    
    it(printTitle('userFirst', 'claims his refund and has a 0 token balance'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userFirstBalance = Number(web3.eth.getBalance(userFirst).valueOf());
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                    // Contribution
                    var firstUsercontributionTotal = parseFloat(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                        // Get the total tokens allowed to be made by this agent
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                            // Total tokens available
                            var totalTokensAvailable = parseFloat(result.valueOf());
                            // Get the contribution balance of their account now after withdrawing
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                                // Contributions total now
                                var firstUsercontributionTotalAfter = parseFloat(result.valueOf());
                                // Get the contribution balance of their account now after withdrawing
                                return rocketPoolTokenInstance.balanceOf.call(userFirst).then(function (result) {
                                    // Token total now
                                    var tokenTotalAfter = parseFloat(result.valueOf());
                                    // Get the users current ether balance after withdrawing tokens, should have the refund
                                    var userFirstBalanceAfter = web3.eth.getBalance(userFirst).valueOf();
                                         // Calculate tokens were not given out and the user received their refund                                   
                                        return tokenTotalAfter == 0 &&
                                               Number(web3.fromWei(userFirstBalanceAfter, 'ether')).toFixed(2) == Number(web3.fromWei(userFirstBalance + firstUsercontributionTotal, 'ether')).toFixed(2) ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
   }); // End Test   
    
   
   it(printTitle('userSecond', 'claims his refund and has a 0 token balance'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userFirstBalance = Number(web3.eth.getBalance(userSecond).valueOf());
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                    // Contribution
                    var firstUsercontributionTotal = parseFloat(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                        // Get the total tokens allowed to be made by this agent
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                            // Total tokens available
                            var totalTokensAvailable = parseFloat(result.valueOf());
                            // Get the contribution balance of their account now after withdrawing
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                                // Contributions total now
                                var firstUsercontributionTotalAfter = parseFloat(result.valueOf());
                                // Get the contribution balance of their account now after withdrawing
                                return rocketPoolTokenInstance.balanceOf.call(userSecond).then(function (result) {
                                    // Token total now
                                    var tokenTotalAfter = parseFloat(result.valueOf());
                                    // Get the users current ether balance after withdrawing tokens, should have the refund
                                    var userFirstBalanceAfter = web3.eth.getBalance(userSecond).valueOf();
                                         // Calculate tokens were not given out and the user received their refund                                   
                                        return tokenTotalAfter == 0 &&
                                               Number(web3.fromWei(userFirstBalanceAfter, 'ether')).toFixed(2) == Number(web3.fromWei(userFirstBalance + firstUsercontributionTotal, 'ether')).toFixed(2) ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
    }); // End Test 
    
    
    it(printTitle('userSixth', 'claims his refund and has a 0 token balance'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userSixthBalance = Number(web3.eth.getBalance(userSixth).valueOf());
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userSixth).then(function (result) {
                    // Contribution
                    var userSixthcontributionTotal = parseFloat(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userSixth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                        // Get the total tokens allowed to be made by this agent
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                            // Total tokens available
                            var totalTokensAvailable = parseFloat(result.valueOf());
                            // Get the contribution balance of their account now after withdrawing
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSixth).then(function (result) {
                                // Contributions total now
                                var userSixthcontributionTotalAfter = parseFloat(result.valueOf());
                                // Get the contribution balance of their account now after withdrawing
                                return rocketPoolTokenInstance.balanceOf.call(userSixth).then(function (result) {
                                    // Token total now
                                    var tokenTotalAfter = parseFloat(result.valueOf());
                                    // Get the users current ether balance after withdrawing tokens, should have the refund
                                    var userSixthBalanceAfter = web3.eth.getBalance(userSixth).valueOf();
                                         // Calculate tokens were not given out and the user received their refund                                   
                                        return tokenTotalAfter == 0 &&
                                               Number(web3.fromWei(userSixthBalanceAfter, 'ether')).toFixed(2) == Number(web3.fromWei(userSixthBalance + userSixthcontributionTotal, 'ether')).toFixed(2) ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
    }); // End Test 


    it(printTitle('userFourth', 'fails to make deposit to crowdsale of 0.1 ether as crowdsale target was not met and is over'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('0.1', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFourth, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test     


     it(printTitle('crowdsaleContract', 'minted tokens = 0 and sale agent balance = 0'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userFirstBalance = Number(web3.eth.getBalance(userFirst).valueOf());
                // Get the contribution balance of their account now
                return rocketPoolTokenInstance.getSaleContractTokensMinted.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Check the amount of ether the contract still holds
                    var contractEther = web3.eth.getBalance(rocketPoolCrowdsaleInstance.address).valueOf();
                    // No tokens minted?
                    return parseFloat(result.valueOf()) == 0 && contractEther == 0 ? true : false;
                }).then(function (result) {
                    assert.isTrue(result, "Crowdsale minted tokens = 0.");
                });
            });
        });
   }); // End Test   
    

   /** REGISTER ANOTHER SALE AGENT CROWDSALE */
    
   // Begin Tests
    it(printTitle('owner', 'register another crowdsale agent since the first was not successfull'), function () {
        // Contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Transaction
            return rocketPoolTokenInstance.setSaleAgentContract(
                userFirst,
                'nextcrowdsalecontract',
                1,          // Min target ether
                100,        // Max target ether
                saleContracts.crowdsale.tokensLimit, // Token limit
                0,          // Min deposit
                100,        // Max deposit
                0,          // Start block
                5000,       // End block
                saleContracts.crowdsale.depositAddress,
                { from: owner, gas: 550000 }).then(function (result) {
                    // Check its registered
                    return rocketPoolTokenInstance.getSaleContractTokensLimit.call(userFirst).then(function (result) {
                        // Check the token total was registered
                        return result.valueOf() == saleContracts.crowdsale.tokensLimit ? true : false;
                    }).then(function (result) {
                        assert.isTrue(result, "New crowdsale contract deployed.");
                    });
                });
        });
     }); // End Test  
    
    



   

   
});



 


