var rocketPoolCrowdsale = artifacts.require("./contract/RocketPoolCrowdsale.sol");

var exponent = Math.pow(10, 18); // 18 Decimal places
var totalSupply = 50 * Math.pow(10, 6) * exponent; // 50mil
var totalContributions = 0;
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


// Create a snapshot at genesis block, so each text after this starts from there
/*
web3.currentProvider.sendSync({
    jsonrpc: "2.0",
    method: "evm_snapshot",
    id: 12345
}, function(err, result) {
    // this is your callback
    console.log('SNAPSHOT');
});
*/

// Start the token and crowdsale tests now
contract('RocketPoolCrowdsale', function (accounts) {

    // Our contributers    
    var owner = accounts[0];
    var userFirst = accounts[1];
    var userSecond = accounts[2];
    var userThird = accounts[3];
    var userFourth = accounts[4];
    var userFifth = accounts[5];


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


    

    // Begin Tests
    it(printTitle('userFirst', 'fails to deposit before the crowdsale begins'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1', 'ether'); 
            // Transaction
            return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                return result;
            }).then(function(result) { 
               assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test  

    // Block 5 should have been reached now for the start of the crowdfund
    it(printTitle('userFirst', 'fails to deposit by sending more than the maxEthAllocation will allow per account'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the max ether per account
            return rocketPoolCrowdsaleInstance.maxEthAllocation.call().then(function (result) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = parseInt(web3.toWei('1', 'ether')) + parseInt(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                    return result;
                }).then(function(result) { 
                assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
           
        });    
    }); // End Test    

    
    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 1 ether'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1', 'ether'); 
            // Transaction
            return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.contributionOf.call(userFirst).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                });
            }).then(function (result) {
                assert.isTrue(result, "Contribution made successfully.");
            }); 
        });    
    }); // End Test 



    it(printTitle('depositAddress', 'fails to call finaliseFunding successfully while crowdsale is running'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the max ether per account
            return rocketPoolCrowdsaleInstance.finaliseFunding({ from: web3.eth.coinbase, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                  return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });   
    }); // End Test   


    it(printTitle('userFirst', 'fails to deposit using by adding to their deposit that than exceeds the maxEthAllocation will allow per account'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the max ether per account
            return rocketPoolCrowdsaleInstance.maxEthAllocation.call().then(function (result) {
                // Contribute amount
                var sendAmount = parseInt(web3.toWei('10', 'ether')) + parseInt(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                    return result;
                }).then(function(result) { 
                assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
           
        });    
    }); // End Test    


    it(printTitle('userFirst', 'makes another successful deposit to max out their account contribution'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.contributionOf.call(userFirst).then(function (result) {
                // His contrbutions so far
                var userFirstContributionTotal = parseInt(result.valueOf());
                // Get the max ether per account
                return rocketPoolCrowdsaleInstance.maxEthAllocation.call().then(function (result) {
                    var maxEthAllocation = parseInt(result.valueOf());
                    // Contribute the exact amount needed to set it at the per account threshold
                    var sendAmount = maxEthAllocation - userFirstContributionTotal; 
                    // Transaction
                    return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                        // Get the contribution balance of their account now
                        return rocketPoolCrowdsaleInstance.contributionOf.call(userFirst).then(function (result) {
                            return result.valueOf() == maxEthAllocation ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "Contribution made successfully.");
                        });
                    }); 
                });
            });
        });    
    }); // End Test 


    it(printTitle('userFirst', 'fails to deposit using by adding to their deposit that than exceeds the maxEthAllocation will allow per account'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = parseInt(web3.toWei('1', 'ether'));
            // Transaction
            return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test  


    it(printTitle('userSecond', 'deposits the maxEthAllocation for their contribution'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the max ether per account
            return rocketPoolCrowdsaleInstance.maxEthAllocation.call().then(function (result) {
                // Contribute amount
                var sendAmount = parseInt(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.contributionOf.call(userSecond).then(function (result) {
                        return result.valueOf() == sendAmount ? true : false;
                    }).then(function (result) {
                        assert.isTrue(result, "Contribution made successfully.");
                    });
                });
            });
           
        });    
    }); // End Test  

    it(printTitle('userThird', 'makes successful deposit to crowdsale of 1.33333945012327895 ether'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1.33333945012327895', 'ether');
            // Transaction
            return rocketPoolCrowdsaleInstance.sendTransaction({ from: userThird, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.contributionOf.call(userThird).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userThird', 'fails to attempt early withdrawl of tokens'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Transaction
            return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userThird, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                   return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test     



    // ******* Crowdsale hits block < 16, closes **************

 
    it(printTitle('userFourth', 'makes successful deposit to crowdsale of 0.5 ether'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('0.5', 'ether');
            // Transaction
            return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFourth, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.contributionOf.call(userFourth).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test   
    

  
    it(printTitle('userFourth', 'fails to make deposit to crowdsale of 0.5 ether as crowdsale end block is hit'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('0.5', 'ether');
            // Transaction
            return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFourth, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                   return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test     


    it(printTitle('userFifth', 'fails to make a withdrawal without having contributed anything'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Transaction
            return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userFifth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                   return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test  


    it(printTitle('userFirst', 'gets the total amount of contributions'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.contributedTotal.call(userFirst).then(function (result) {
                totalContributions = result.valueOf();
            });
        });
    });


    it(printTitle('userFirst', 'withdraws his tokens and gets refund'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the users current ether balance
            var userFirstBalance = web3.eth.getBalance(userFirst).valueOf();
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.contributionOf.call(userFirst).then(function (result) {
                // Contribution
                var firstUsercontributionTotal = parseFloat(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                    // Get the contribution balance of their account now after withdrawing
                    return rocketPoolCrowdsaleInstance.contributionOf.call(userFirst).then(function (result) {
                        // Contributions total now
                        var firstUsercontributionTotalAfter = parseFloat(result.valueOf());
                        // Get the contribution balance of their account now after withdrawing
                        return rocketPoolCrowdsaleInstance.balanceOf.call(userFirst).then(function (result) {
                            // Token total now
                            var tokenTotalAfter = parseFloat(result.valueOf());
                            // Get the users current ether balance after withdrawing tokens, should have the refund
                            var userFirstBalanceAfter = web3.eth.getBalance(userFirst).valueOf();
                            //console.log(tokenTotalAfter/exponent, parseFloat((firstUsercontributionTotal / totalContributions) * totalSupply)/exponent);
                            // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                            return userFirstBalanceAfter > userFirstBalance && 
                                    // Calculate tokes were awarded correctly
                                    (tokenTotalAfter/exponent).toFixed(6) == (parseFloat((firstUsercontributionTotal / totalContributions) * totalSupply)/exponent).toFixed(6) && 
                                    firstUsercontributionTotalAfter == 0
                                    ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "Withdrawn tokens and refund.");
                        });
                    })
                });
            });
        });    
    }); // End Test   



    it(printTitle('userSecond', 'withdraws her tokens and gets refund'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the users current ether balance
            var userSecondBalance = web3.eth.getBalance(userSecond).valueOf();
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.contributionOf.call(userSecond).then(function (result) {
                // Contribution
                var secondUsercontributionTotal = parseFloat(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                    // Get the contribution balance of their account now after withdrawing
                    return rocketPoolCrowdsaleInstance.contributionOf.call(userSecond).then(function (result) {
                        // Contributions total now
                        var secondUsercontributionTotalAfter = parseFloat(result.valueOf());
                        // Get the contribution balance of their account now after withdrawing
                        return rocketPoolCrowdsaleInstance.balanceOf.call(userSecond).then(function (result) {
                            // Token total now
                            var tokenTotalAfter = parseFloat(result.valueOf());
                            // Get the users current ether balance after withdrawing tokens, should have the refund
                            var userSecondBalanceAfter = web3.eth.getBalance(userSecond).valueOf();
                            // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                            return userSecondBalanceAfter > userSecondBalance && 
                                    // Calculate tokes were awarded correctly
                                    (tokenTotalAfter/exponent).toFixed(6) == (parseFloat((secondUsercontributionTotal / totalContributions) * totalSupply)/exponent).toFixed(6) && 
                                    secondUsercontributionTotalAfter == 0
                                    ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "Withdrawn Tokens and Refund.");
                        });
                    })
                });
            });
        });    
    }); // End Test 


    it(printTitle('userSecond', 'fails to withdraw again'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Transaction
            return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                   return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test  


    it(printTitle('userThird', 'withdraws his tokens and gets refund'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the users current ether balance
            var userThirdBalance = web3.eth.getBalance(userThird).valueOf();
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.contributionOf.call(userThird).then(function (result) {
                // Contribution
                var userThirdcontributionTotal = parseFloat(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userThird, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                    // Get the contribution balance of their account now after withdrawing
                    return rocketPoolCrowdsaleInstance.contributionOf.call(userThird).then(function (result) {
                        // Contributions total now
                        var userThirdcontributionTotalAfter = parseFloat(result.valueOf());
                        // Get the contribution balance of their account now after withdrawing
                        return rocketPoolCrowdsaleInstance.balanceOf.call(userThird).then(function (result) {
                            // Token total now
                            var tokenTotalAfter = parseFloat(result.valueOf());
                            // Get the users current ether balance after withdrawing tokens, should have the refund
                            var userThirdBalanceAfter = web3.eth.getBalance(userThird).valueOf();
                            // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                            return userThirdBalanceAfter > userThirdBalance && 
                                   // Calculate tokes were awarded correctly
                                   (tokenTotalAfter/exponent).toFixed(6) == (parseFloat((userThirdcontributionTotal / totalContributions) * totalSupply)/exponent).toFixed(6) && 
                                   userThirdcontributionTotalAfter == 0
                                   ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "Withdrawn Tokens and Refund.");
                        });
                    })
                });
            });
        });    
    }); // End Test 


    it(printTitle('userFourth', 'withdraws his tokens and gets refund'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Get the users current ether balance
            var userFourthBalance = web3.eth.getBalance(userFourth).valueOf();
            // Get the contribution balance of their account now
            return rocketPoolCrowdsaleInstance.contributionOf.call(userFourth).then(function (result) {
                // Contribution
                var userFourthcontributionTotal = parseFloat(result.valueOf());
                // Transaction
                return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userFourth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                    // Get the contribution balance of their account now after withdrawing
                    return rocketPoolCrowdsaleInstance.contributionOf.call(userFourth).then(function (result) {
                        // Contributions total now
                        var userFourthcontributionTotalAfter = parseFloat(result.valueOf());
                        // Get the contribution balance of their account now after withdrawing
                        return rocketPoolCrowdsaleInstance.balanceOf.call(userFourth).then(function (result) {
                            // Token total now
                            var tokenTotalAfter = parseFloat(result.valueOf());
                            // Get the users current ether balance after withdrawing tokens, should have the refund
                            var userFourthBalanceAfter = web3.eth.getBalance(userFourth).valueOf();
                            // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                            //console.log((tokenTotalAfter/exponent).toFixed(6), (parseFloat((userFourthcontributionTotal / totalContributions) * totalSupply)/exponent).toFixed(6));
                            return userFourthBalanceAfter > userFourthBalance && 
                                   // Calculate tokes were awarded correctly
                                   (tokenTotalAfter/exponent).toFixed(6) == (parseFloat((userFourthcontributionTotal / totalContributions) * totalSupply)/exponent).toFixed(6) && 
                                   userFourthcontributionTotalAfter == 0
                                   ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "Withdrawn Tokens and Refund.");
                        });
                    })
                });
            });
        });    
    }); // End Test 


    it(printTitle('tokenContract', 'should have distrubuted all tokens from its account now to the users'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Distributed tokens
            var tokenTotalOfUsers = 0;
            // Get the user token balance now after all accounts have withdrawn
            return rocketPoolCrowdsaleInstance.balanceOf.call(userFirst).then(function (result) {
                // Add to total
                tokenTotalOfUsers += parseFloat(result.valueOf());
                // Get the contract token balance now after all accounts have withdrawn
                return rocketPoolCrowdsaleInstance.balanceOf.call(userSecond).then(function (result) {
                    // Add to total
                    tokenTotalOfUsers += parseFloat(result.valueOf());
                    // Get the contract token balance now after all accounts have withdrawn
                    return rocketPoolCrowdsaleInstance.balanceOf.call(userThird).then(function (result) {
                        // Add to total
                        tokenTotalOfUsers += parseFloat(result.valueOf());
                        // Get the contract token balance now after all accounts have withdrawn
                        return rocketPoolCrowdsaleInstance.balanceOf.call(userFourth).then(function (result) {
                            // Add to total
                            tokenTotalOfUsers += parseFloat(result.valueOf());
                             // Get the contract token balance now after all accounts have withdrawn
                            return rocketPoolCrowdsaleInstance.balanceOf.call(userFifth).then(function (result) {
                                // Add to total
                                tokenTotalOfUsers += parseFloat(result.valueOf());
                                //console.log(tokenTotalOfUsers/exponent, totalSupply/exponent);
                                // Should have none
                                return tokenTotalOfUsers == totalSupply ? true : false;
                            }).then(function (result) {
                                assert.isTrue(result, "Withdrawn All Tokens.");
                            });
                   
                        });
                    });
                });
            });
               
        });    
    }); // End Test 
   
});



 


