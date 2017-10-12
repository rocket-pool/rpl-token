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

    it(printTitle('userFirst', 'makes successful deposit to crowdsale of 1 ether'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1', 'ether'); 
            // Transaction
            return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                });
            }).then(function (result) {
                assert.isTrue(result, "Contribution made successfully.");
            }); 
        });    
    }); // End Test 
    


    it(printTitle('userFirst', 'fails to deposit by sending more than the maxDeposit will allow per account'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the max ether per account
                return rocketPoolTokenInstance.getSaleContractDepositEtherMax.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Contribute amount = 1 ether more than allowed
                    var sendAmount = Number(result.valueOf()) + Number(web3.toWei('1', 'ether'));
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

    
    it(printTitle('userFirst', 'makes another successful deposit at the maxiumum allowed'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                    // His contrbutions so far
                    var userFirstContributionTotal = Number(result.valueOf());
                    // Get the max ether per account
                    return rocketPoolTokenInstance.getSaleContractDepositEtherMax.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                        var maxEthAllocation = Number(result.valueOf());
                        // Contribute the exact amount needed to set it at the per account threshold
                        var sendAmount = maxEthAllocation;
                        // Transaction
                        return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFirst, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                            // Get the contribution balance of their account now
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFirst).then(function (result) {
                                // Check all good
                                return result.valueOf() == (maxEthAllocation + userFirstContributionTotal) ? true : false;
                            }).then(function (result) {
                                assert.isTrue(result, "Contribution made successfully.");
                            });
                        });
                    });
                });
            });
        });    
    }); // End Test 
 
   
    it(printTitle('userSecond', 'deposits at the maxiumum allowed in a single transaction, this meets the targetEth require for the sale, depositAddress receives funds'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the current depositAddress funds
                var depositAddressAccountBefore = Number(web3.eth.getBalance(saleContracts.crowdsale.depositAddress));
                // Get the max ether per account
                return rocketPoolTokenInstance.getSaleContractDepositEtherMax.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Contribute amount
                    var sendAmount = Number(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        // Get the contribution balance of their account now
                        return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                            // Balance after
                            var depositAddressAccountAfter = Number(web3.eth.getBalance(saleContracts.crowdsale.depositAddress));
                            
                            //console.log(depositAddressAccountAfter);
                            //console.log(depositAddressAccountBefore);
                            //console.log(saleContracts.crowdsale.targetEthMin);
                             return result.valueOf() == sendAmount && depositAddressAccountAfter == (Number(depositAddressAccountBefore) + Number(saleContracts.crowdsale.targetEthMin)) ? true : false;
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
                //console.log(web3.eth.getBalance(rocketPoolCrowdsaleInstance.address).valueOf());
                // Contribute amount
                var sendAmount = web3.toWei('1.33333945012327895', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userThird, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
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


    it(printTitle('userThird', 'fails to attempt early withdrawl of tokens'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Transaction
                return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userThird, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test   


    it(printTitle('depositAddress', 'fails to finalise crowdsale while its still running'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Transaction
                return rocketPoolCrowdsaleInstance.finaliseFunding({ from: saleContracts.crowdsale.depositAddress, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test   


    it(printTitle('userFourth', 'makes successful deposit to crowdsale of 0.5 ether'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('0.5', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userFourth, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userFourth).then(function (result) {
                        return result.valueOf() == sendAmount ? true : false;
                    }).then(function (result) {
                        assert.isTrue(result, "Contribution made successfully.");
                    });
                });
            });
        });
    }); // End Test  
    
    
    it(printTitle('userSixth', 'makes successful deposit to crowdsale of 1 ether'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolCrowdsaleInstance.sendTransaction({ from: userSixth, to: rocketPoolCrowdsaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    // Get the contribution balance of their account now
                    return rocketPoolCrowdsaleInstance.getContributionOf.call(userSixth).then(function (result) {
                        return result.valueOf() == sendAmount ? true : false;
                    }).then(function (result) {
                        assert.isTrue(result, "Contribution made successfully.");
                    });
                });
            });
        });
    }); // End Test   

    

     // ******* Crowdsale hits end block, closes **************


    
    it(printTitle('userFourth', 'fails to make deposit to crowdsale of 0.5 ether as crowdsale end block is hit'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('0.5', 'ether');
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


    it(printTitle('userFifth', 'fails to make a withdrawal without having contributed anything'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Transaction
                return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userFifth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test  


    it(printTitle('userFirst', 'gets the total amount of contributions'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.contributedTotal.call({ from: userFirst }).then(function (result) {                   
                    totalContributions = result.valueOf();
                });
            });
        });
    });


    it(printTitle('userFirst', 'withdraws his tokens and gets refund'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userFirstBalance = web3.eth.getBalance(userFirst).valueOf();
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
                                    // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                                    return userFirstBalanceAfter > userFirstBalance &&
                                        // Calculate tokens were awarded correctly
                                        (tokenTotalAfter / exponent).toFixed(6) == (parseFloat((firstUsercontributionTotal / totalContributions) * totalTokensAvailable) / exponent).toFixed(6) &&
                                        firstUsercontributionTotalAfter == 0
                                        ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn tokens and refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
    }); // End Test   


    it(printTitle('userSecond', 'withdraws her tokens and gets refund'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userSecondBalance = web3.eth.getBalance(userSecond).valueOf();
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                    // Contribution
                    var secondUsercontributionTotal = parseFloat(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                        // Get the total tokens allowed to be made by this agent
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                            // Total tokens available
                            var totalTokensAvailable = parseFloat(result.valueOf());
                            // Get the contribution balance of their account now after withdrawing
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userSecond).then(function (result) {
                                // Contributions total now
                                var secondUsercontributionTotalAfter = parseFloat(result.valueOf());
                                // Get the contribution balance of their account now after withdrawing
                                return rocketPoolTokenInstance.balanceOf.call(userSecond).then(function (result) {
                                    // Token total now
                                    var tokenTotalAfter = parseFloat(result.valueOf());
                                    // Get the users current ether balance after withdrawing tokens, should have the refund
                                    var userSecondBalanceAfter = web3.eth.getBalance(userSecond).valueOf();
                                    // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                                    return userSecondBalanceAfter > userSecondBalance &&
                                        // Calculate tokens were awarded correctly
                                        (tokenTotalAfter / exponent).toFixed(6) == (parseFloat((secondUsercontributionTotal / totalContributions) * totalTokensAvailable) / exponent).toFixed(6) &&
                                        secondUsercontributionTotalAfter == 0
                                        ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn Tokens and Refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
    }); // End Test 


    it(printTitle('userSecond', 'fails to withdraw again'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Transaction
                return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userSecond, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test  


    it(printTitle('userThird', 'withdraws his tokens and gets refund'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userThirdBalance = web3.eth.getBalance(userThird).valueOf();
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userThird).then(function (result) {
                    // Contribution
                    var userThirdcontributionTotal = parseFloat(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userThird, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                         // Get the total tokens allowed to be made by this agent
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                            // Total tokens available
                            var totalTokensAvailable = parseFloat(result.valueOf());
                            // Get the contribution balance of their account now after withdrawing
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userThird).then(function (result) {
                                // Contributions total now
                                var userThirdcontributionTotalAfter = parseFloat(result.valueOf());
                                // Get the contribution balance of their account now after withdrawing
                                return rocketPoolTokenInstance.balanceOf.call(userThird).then(function (result) {
                                    // Token total now
                                    var tokenTotalAfter = parseFloat(result.valueOf());
                                    // Get the users current ether balance after withdrawing tokens, should have the refund
                                    var userThirdBalanceAfter = web3.eth.getBalance(userThird).valueOf();
                                    // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                                    return userThirdBalanceAfter > userThirdBalance &&
                                        // Calculate tokes were awarded correctly
                                        (tokenTotalAfter / exponent).toFixed(6) == (parseFloat((userThirdcontributionTotal / totalContributions) * totalTokensAvailable) / exponent).toFixed(6) &&
                                        userThirdcontributionTotalAfter == 0
                                        ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn Tokens and Refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
    }); // End Test 


    it(printTitle('userFourth', 'withdraws his tokens and gets refund'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userFourthBalance = web3.eth.getBalance(userFourth).valueOf();
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userFourth).then(function (result) {
                    // Contribution
                    var userFourthcontributionTotal = parseFloat(result.valueOf());
                    // Transaction
                    return rocketPoolCrowdsaleInstance.claimTokensAndRefund({ from: userFourth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                        // Get the total tokens allowed to be made by this agent
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                            // Total tokens available
                            var totalTokensAvailable = parseFloat(result.valueOf());
                            // Get the contribution balance of their account now after withdrawing
                            return rocketPoolCrowdsaleInstance.getContributionOf.call(userFourth).then(function (result) {
                                // Contributions total now
                                var userFourthcontributionTotalAfter = parseFloat(result.valueOf());
                                // Get the contribution balance of their account now after withdrawing
                                return rocketPoolTokenInstance.balanceOf.call(userFourth).then(function (result) {
                                    // Token total now
                                    var tokenTotalAfter = parseFloat(result.valueOf());
                                    // Get the users current ether balance after withdrawing tokens, should have the refund
                                    var userFourthBalanceAfter = web3.eth.getBalance(userFourth).valueOf();
                                    // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                                    return userFourthBalanceAfter > userFourthBalance &&
                                        // Calculate tokes were awarded correctly
                                        (tokenTotalAfter / exponent).toFixed(6) == (parseFloat((userFourthcontributionTotal / totalContributions) * totalTokensAvailable) / exponent).toFixed(6) &&
                                        userFourthcontributionTotalAfter == 0
                                        ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn Tokens and Refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
    }); // End Test 

    it(printTitle('userSixth', 'attempts to trigger owner method for triggering release of a users tokens'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Transaction
                return rocketPoolCrowdsaleInstance.ownerClaimTokensAndRefundForUser(userSixth, { from: userSixth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test  

    it(printTitle('userSixth', 'attempts to kill contract'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Transaction
                return rocketPoolCrowdsaleInstance.kill({ from: userSixth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test  

    it(printTitle('userSixth', 'gets the owner to trigger his token withdrawal for him, gets tokens and refund'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the users current ether balance
                var userSixthBalance = web3.eth.getBalance(userSixth).valueOf();
                // Get the contribution balance of their account now
                return rocketPoolCrowdsaleInstance.getContributionOf.call(userSixth).then(function (result) {
                    // Contribution
                    var userSixthcontributionTotal = parseFloat(result.valueOf());
                    // Owner triggers claim for user
                    return rocketPoolCrowdsaleInstance.ownerClaimTokensAndRefundForUser(userSixth, { from: owner, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
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
                                    // Should have received refund, have no contributions left and have tokens that match the calculated proportion
                                    return userSixthBalanceAfter > userSixthBalance &&
                                        // Calculate tokes were awarded correctly
                                        (tokenTotalAfter / exponent).toFixed(6) == (parseFloat((userSixthcontributionTotal / totalContributions) * totalTokensAvailable) / exponent).toFixed(6) &&
                                        userSixthcontributionTotalAfter == 0
                                        ? true : false;
                                }).then(function (result) {
                                    assert.isTrue(result, "Withdrawn Tokens and Refund.");
                                });
                            });
                        });
                    });
                });
            });
        });
    }); // End Test 


    it(printTitle('tokenContract', 'should have distrubuted tokens to the users'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the total tokens allowed to be made by this agent
                return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Total tokens available
                    var totalTokensAvailable = parseFloat(result.valueOf());
                    // Distributed tokens
                    var tokenTotalOfUsers = 0;
                    // Get the user token balance now after all accounts have withdrawn
                    return rocketPoolTokenInstance.balanceOf.call(userFirst).then(function (result) {
                        // Add to total
                        tokenTotalOfUsers += parseFloat(result.valueOf());
                        // Get the contract token balance now after all accounts have withdrawn
                        return rocketPoolTokenInstance.balanceOf.call(userSecond).then(function (result) {
                            // Add to total
                            tokenTotalOfUsers += parseFloat(result.valueOf());
                            // Get the contract token balance now after all accounts have withdrawn
                            return rocketPoolTokenInstance.balanceOf.call(userThird).then(function (result) {
                                // Add to total
                                tokenTotalOfUsers += parseFloat(result.valueOf());
                                // Get the contract token balance now after all accounts have withdrawn
                                return rocketPoolTokenInstance.balanceOf.call(userFourth).then(function (result) {
                                    // Add to total
                                    tokenTotalOfUsers += parseFloat(result.valueOf());
                                    // Get the contract token balance now after all accounts have withdrawn
                                    return rocketPoolTokenInstance.balanceOf.call(userFifth).then(function (result) {
                                        // Add to total
                                        tokenTotalOfUsers += parseFloat(result.valueOf());
                                        // Get the contract token balance now after all accounts have withdrawn
                                        return rocketPoolTokenInstance.balanceOf.call(userSixth).then(function (result) {
                                            // Add to total
                                            tokenTotalOfUsers += parseFloat(result.valueOf());
                                            //console.log(Math.round(tokenTotalOfUsers/exponent), totalTokensAvailable/exponent);
                                            // Should have none
                                            return Math.round(tokenTotalOfUsers / exponent) == Math.round(totalTokensAvailable / exponent) ? true : false;
                                        }).then(function (result) {
                                            assert.isTrue(result, "Withdrawn All Tokens.");
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });    
    }); // End Test 


     it(printTitle('userFifth', 'fails to finalise the crowdsale as they are not the depositAddress'), function () {
        // Crowdsale contract   
        return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
            // Transaction
            return rocketPoolCrowdsaleInstance.finaliseFunding({ from: userFifth, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function(result) {
                   return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test 


    it(printTitle('depositAddress', 'finalises the crowdsale and receives the ether'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the total tokens allowed to be made by this agent
                return rocketPoolTokenInstance.getSaleContractTargetEtherMin.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Get the ether target used for the sale
                    var targetEth = Number(result.valueOf());
                    // Get the users current ether balance
                    var depositAddressBalance = web3.eth.getBalance(saleContracts.crowdsale.depositAddress).valueOf();
                    // Transaction
                    return rocketPoolCrowdsaleInstance.finaliseFunding({ from: saleContracts.crowdsale.depositAddress, to: rocketPoolCrowdsaleInstance.address, gas: 550000 }).then(function (result) {
                        // Get the users current ether balance after
                        var depositAddressBalanceAfter = web3.eth.getBalance(saleContracts.crowdsale.depositAddress).valueOf();
                        // Our event values
                        var ethSentToAddress = '';
                        var ethValueSent = 0;
                        // Go through our events
                        for (var i = 0; i < result.logs.length; i++) {
                            if (result.logs[i].event == 'FinaliseSale') {
                                ethSentToAddress = result.logs[i].args._sender.valueOf();
                                ethValueSent = result.logs[i].args._value.valueOf();
                                saleAgent = result.logs[i].args._agent.valueOf();
                            }
                        }
                        //console.log(ethValueSent);
                        //console.log(targetEth);
                        //console.log(ethSentToAddress);
                        //console.log(saleContracts.crowdsale.depositAddress);
                        // The ethValueSent is now done when the target is met, not at the end
                        return ethValueSent == 0 && ethSentToAddress == saleContracts.crowdsale.depositAddress ? true : false;
                    }).then(function (result) {
                        assert.isTrue(result, "Finalised crowdsale and ether sent.");
                    });
                });
            });
        });
    }); // End Test  



   it(printTitle('userFirst', 'sends 10 tokens to userSecond successfully'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Get the token balance of their account
            return rocketPoolTokenInstance.balanceOf.call(userFirst).then(function (result) {
                // userFirst
                var userFirstTokenBalance = Number(result.valueOf());
                // Get the token balance of their account
                return rocketPoolTokenInstance.balanceOf.call(userSecond).then(function (result) {
                    // userSecond
                    var userSecondTokenBalance = Number(result.valueOf());
                    // 10 Tokens
                    var tokenAmount = Number(web3.toWei(10, 'ether'));
                    // Transfer 10 tokens to second user now
                    return rocketPoolTokenInstance.transfer(userSecond, tokenAmount, { from: userFirst, gas: 150000 }).then(function (result) {
                        // Get the token balance of their account
                        return rocketPoolTokenInstance.balanceOf.call(userFirst).then(function (result) {
                            // userFirst after
                            var userFirstTokenBalanceAfter = Number(result.valueOf());
                            // Get the token balance of their account
                            return rocketPoolTokenInstance.balanceOf.call(userSecond).then(function (result) {
                                // userSecond after
                                var userSecondTokenBalanceAfter = Number(result.valueOf());
                                // Format it
                                tokenAmount = Math.round(web3.fromWei(tokenAmount, 'ether'));        
                                // Ok check the balances are correct now - use round to avoid minute floating point rounding issues when adding/subtracting in js
                                return  Math.round(web3.fromWei(userFirstTokenBalanceAfter, 'ether')) == (Math.round(web3.fromWei(userFirstTokenBalance, 'ether')) - tokenAmount) &&
                                        Math.round(web3.fromWei(userSecondTokenBalanceAfter, 'ether')) == (Math.round(web3.fromWei(userSecondTokenBalance, 'ether')) + tokenAmount)
                                        ? true : false;
                            }).then(function (result) {
                                assert.isTrue(result, "userSecond receives correct amount of tokens.");
                            });
                        });
                    });
                });
            });                    
        });
    }); // End Test  


    it(printTitle('owner', 'fails to kill contract early'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Transaction
                return rocketPoolCrowdsaleInstance.kill({ from: owner, to: rocketPoolCrowdsaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test 

   
});



 


