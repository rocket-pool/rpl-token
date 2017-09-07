// Load contracts
var rocketPoolToken = artifacts.require("./contract/RocketPoolToken.sol");
var rocketPoolPresale = artifacts.require("./contract/RocketPoolPresale.sol");

// Show events
var displayEvents = false;

// Display events triggered during the tests
if(displayEvents) {
    rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
        var eventWatch = rocketPoolPresaleInstance.allEvents({
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


// Start the token and presale tests now
contract('rocketPoolPresale', function (accounts) {

    // Set our presale units
    var exponent = 0;
    var totalSupply = 0;
    var totalSupplyCap = 0;
    // Token price for presale is calculated as maxTargetEth / tokensLimit
    var tokenPriceInEther = 0;

    // Set our presale addresses
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
        // Type of contract ie presale, presale, quarterly 
        'presale': {
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
            // Deposit address that will be allowed to withdraw the presales ether - this is overwritten with the coinbase address for testing here
            depositAddress: 0,
        }
    }

    
    // Load our token contract settings
    it(printTitle('contractToken', 'load token contract settings'), function () {
        // presale contract   
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



    // Load our presale contract settings
    it(printTitle('contractPresale', 'load presale contract settings'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Get the contract details
                return rocketPoolTokenInstance.getSaleContractTargetEtherMin.call(rocketPoolPresaleInstance.address).then(function(result) {
                    saleContracts.presale.targetEthMin = result.valueOf();
                    return rocketPoolTokenInstance.getSaleContractTargetEtherMax.call(rocketPoolPresaleInstance.address).then(function(result) {
                        saleContracts.presale.targetEthMax = result.valueOf();
                        return rocketPoolTokenInstance.getSaleContractTokensLimit.call(rocketPoolPresaleInstance.address).then(function(result) {
                            saleContracts.presale.tokensLimit = result.valueOf();
                            return rocketPoolTokenInstance.getSaleContractStartBlock.call(rocketPoolPresaleInstance.address).then(function(result) {
                                saleContracts.presale.fundingStartBlock = result.valueOf();
                                return rocketPoolTokenInstance.getSaleContractEndBlock.call(rocketPoolPresaleInstance.address).then(function(result) {
                                    saleContracts.presale.fundingEndBlock = result.valueOf();
                                    return rocketPoolTokenInstance.getSaleContractDepositEtherMin.call(rocketPoolPresaleInstance.address).then(function(result) {
                                        saleContracts.presale.minDeposit = result.valueOf();
                                        return rocketPoolTokenInstance.getSaleContractDepositEtherMax.call(rocketPoolPresaleInstance.address).then(function (result) {
                                            saleContracts.presale.maxDeposit = result.valueOf();
                                            return rocketPoolTokenInstance.getSaleContractDepositAddress.call(rocketPoolPresaleInstance.address).then(function (result) {
                                                saleContracts.presale.depositAddress = result.valueOf();
                                                // Set the token price in ether now - maxTargetEth / tokensLimit
                                                tokenPriceInEther = saleContracts.presale.targetEthMax / saleContracts.presale.tokensLimit;
                                                // Log it
                                                console.log("\n");
                                                console.log(printTitle('Sale Agent Details', '--------------------------'));
                                                console.log("\n");
                                                console.log(printTitle(' Target Ether Min', web3.fromWei(saleContracts.presale.targetEthMin, 'ether')));
                                                console.log(printTitle(' Target Ether Max', web3.fromWei(saleContracts.presale.targetEthMax, 'ether')));
                                                console.log(printTitle(' Start Block', saleContracts.presale.fundingStartBlock));
                                                console.log(printTitle(' End Block', saleContracts.presale.fundingEndBlock));
                                                console.log(printTitle(' Min Deposit', web3.fromWei(saleContracts.presale.minDeposit, 'ether')));
                                                console.log(printTitle(' Max Deposit', web3.fromWei(saleContracts.presale.maxDeposit, 'ether')));
                                                console.log(printTitle(' Deposit Address', saleContracts.presale.depositAddress));
                                                console.log(printTitle(' Token Price in Ether', tokenPriceInEther));
                                                console.log(printTitle(' Tokens Per Ether', Number(1 / tokenPriceInEther).toFixed(0)));
                                                console.log("\n");
                                                return saleContracts.presale.depositAddress != 0 ? true : false;
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
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether
                var sendAmount = web3.toWei('1', 'ether');
                // Get the contract details
                return rocketPoolPresaleInstance.sendTransaction({ from: userFirst, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
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
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Get the contract details
                return rocketPoolPresaleInstance.setDepositAddressVerify({ from: saleContracts.presale.depositAddress, gas: 250000 }).then(function (result) {
                    // Token contract, verify our reservefund contract has been verified   
                    return rocketPoolTokenInstance.getSaleContractDepositAddressVerified.call(rocketPoolPresaleInstance.address, { from: saleContracts.presale.depositAddress }).then(function (result) {
                        var verified = result.valueOf();
                        return verified == true;
                    }).then(function (result) {
                        assert.isTrue(result, "rocketPoolPresaleInstance depositAddress verified.");
                    });    
                });
            });
        });
    });   


    it(printTitle('userFourth', 'fails to register a presale participant as he\'s not the owner'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether more than allowed
                var reservedEtherAmount = web3.toWei('10', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.addPresaleAllocation(userFourth, reservedEtherAmount, { from: userFourth, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function(result) { 
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test  


    it(printTitle('owner', 'register a presale participant - userFirst (2 ether)'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Reserved amount
                var reservedEtherAmount = web3.toWei('2', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.addPresaleAllocation(userFirst, reservedEtherAmount, { from: owner, gas: 250000 }).then(function (result) {
                    // Now check the reserved amount is correct
                    return rocketPoolPresaleInstance.getPresaleAllocation.call(userFirst).then(function (result) {
                        // Registered ok?
                        return reservedEtherAmount == result.valueOf();
                    }).then(function (result) {
                        assert.isTrue(result, "owner registers new presale participant");
                    });
                });
            });
        });
    }); // End Test  

    
    it(printTitle('owner', 'register a presale participant - userSecond (1 ether)'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Reserved amount
                var reservedEtherAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.addPresaleAllocation(userSecond, reservedEtherAmount, { from: owner, gas: 250000 }).then(function (result) {
                    // Now check the reserved amount is correct
                    return rocketPoolPresaleInstance.getPresaleAllocation.call(userSecond).then(function (result) {
                        // Registered ok?
                        return reservedEtherAmount == result.valueOf();
                    }).then(function (result) {
                        assert.isTrue(result, "owner registers new presale participant");
                    });
                });
            });
        });
    }); // End Test  


    it(printTitle('owner', 'register a presale participant - userThird (0.5 ether)'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Reserved amount
                var reservedEtherAmount = web3.toWei('0.5', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.addPresaleAllocation(userThird, reservedEtherAmount, { from: owner, gas: 250000 }).then(function (result) {
                    // Now check the reserved amount is correct
                    return rocketPoolPresaleInstance.getPresaleAllocation.call(userThird).then(function (result) {
                        // Registered ok?
                        return reservedEtherAmount == result.valueOf();
                    }).then(function (result) {
                        assert.isTrue(result, "owner registers new presale participant");
                    });
                });
            });
        });
    }); // End Test  


    it(printTitle('owner', 'increases ether allocation for presale participant - userThird (0.5 ether)'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Reserved amount
                var reservedEtherAmount = web3.toWei('0.5', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.addPresaleAllocation(userThird, reservedEtherAmount, { from: owner, gas: 250000 }).then(function (result) {
                    // Now check the reserved amount is correct
                    return rocketPoolPresaleInstance.getPresaleAllocation.call(userThird).then(function (result) {
                        // They should have one ether total now (0.5 + 0.5)
                        return web3.toWei('1', 'ether') == result.valueOf();
                    }).then(function (result) {
                        assert.isTrue(result, "owner registers new presale participant");
                    });
                });
            });
        });
    }); // End Test  


    
    it(printTitle('userFourth', 'fails to deposit ether as he\'s not part of the presale'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.sendTransaction({ from: userFourth, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function(result) { 
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test    


    it(printTitle('userFirst', 'deposits more ether than he\'s allocated, receives all his tokens and a refund, depositAddress receives funds instantly'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = web3.toWei('5', 'ether');
                var userBalance = web3.eth.getBalance(userFirst).valueOf();
                var contractBalance = web3.eth.getBalance(rocketPoolPresaleInstance.address).valueOf();
                // Deposit Address balance
                var depositAddressBalance = web3.eth.getBalance(saleContracts.presale.depositAddress);
                // Get the amount that's allocated to the presale user
                return rocketPoolPresaleInstance.getPresaleAllocation.call(userFirst).then(function (result) {
                    // Get the amount
                    var presaleEtherAllocation = result.valueOf();
                    // Transaction
                    return rocketPoolPresaleInstance.sendTransaction({ from: userFirst, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        // Setup our check vars
                        var refund = 0;
                        for(var i=0; i < result.logs.length; i++) {
                            if(result.logs[i].event == 'Refund') {
                                refund = result.logs[i].args._value.valueOf();
                            }
                        };
                        //console.log(presaleEtherAllocation, refund, (sendAmount - presaleEtherAllocation));
                        // Get the token balance of their account now after withdrawing
                        return rocketPoolTokenInstance.balanceOf.call(userFirst).then(function (result) {
                            // The users minted tokens - use toFixed to avoid miniscule rounding errors between js and solidity
                            var userFirstTokens = parseFloat(web3.fromWei(result.valueOf())).toFixed(0);
                            // The amount of expected tokens - use toFixed to avoid miniscule rounding errors between js and solidity
                            var expectedTokens = parseFloat(web3.fromWei(presaleEtherAllocation / tokenPriceInEther, 'ether')).toFixed(0);
                            // Does depositAddress have the funds from userFirst now?
                            var depositAddressBalanceAfter = web3.eth.getBalance(saleContracts.presale.depositAddress);
                            // Make sure the refund is correct and the user has the correct amount of tokens
                            //console.log(userFirstTokens, expectedTokens);
                            return refund == (sendAmount - presaleEtherAllocation) && userFirstTokens == expectedTokens && depositAddressBalanceAfter == (Number(depositAddressBalance) + Number(presaleEtherAllocation)) ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "useFirst receives correct amount of tokens and refund.");
                        });
                    }); 
                });
            });
        });
    }); // End Test   
    

    it(printTitle('userFirst', 'fails to deposit again after he\'s used up his ether allocation'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = web3.toWei('0.5', 'ether');
                var userBalance = web3.eth.getBalance(userFirst).valueOf();
                var contractBalance = web3.eth.getBalance(rocketPoolPresaleInstance.address).valueOf();
                // Get the amount that's allocated to the presale user
                return rocketPoolPresaleInstance.getPresaleAllocation.call(userFirst).then(function (result) {
                    // Get the amount
                    var presaleEtherAllocation = result.valueOf();
                    // Transaction
                    return rocketPoolPresaleInstance.sendTransaction({ from: userFirst, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        return result;
                    }).then(function(result) { 
                        assert(false, "Expect throw but didn't.");
                    }).catch(function (error) {
                        return checkThrow(error);
                    });
                });
            });
        });
    }); // End Test    


   
   it(printTitle('userSecond', 'fails to deposit less than what their allocation requires'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                 // Get the amount that's allocated to the presale user
                return rocketPoolPresaleInstance.getPresaleAllocation.call(userSecond).then(function (result) {
                    // Send just a bit less than what we've been allocated
                    var sendAmount = result.valueOf() - web3.toWei('0.1', 'ether');
                    // Transaction
                    return rocketPoolPresaleInstance.sendTransaction({ from: userSecond, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        return result;
                    }).then(function(result) { 
                        assert(false, "Expect throw but didn't.");
                    }).catch(function (error) {
                        return checkThrow(error);
                    });
                });
            });
        });
    }); // End Test    


    it(printTitle('userSecond', 'deposits the exact amount to cover his presale allocation - receives no refund'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Get the balances
                var userBalance = web3.eth.getBalance(userSecond).valueOf();
                // Get the amount that's allocated to the presale user
                return rocketPoolPresaleInstance.getPresaleAllocation.call(userSecond).then(function (result) {
                    // How much to send to equals the exact amount required
                    var presaleEtherAllocation = result.valueOf();
                    var sendAmount = presaleEtherAllocation;
                    // Transaction
                    return rocketPoolPresaleInstance.sendTransaction({ from: userSecond, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        // Setup our check vars
                        var refund = 0;
                        for(var i=0; i < result.logs.length; i++) {
                            if(result.logs[i].event == 'Refund') {
                                refund = result.logs[i].args._value.valueOf();
                            }
                        };
                        // Get the token balance of their account now after withdrawing
                        return rocketPoolTokenInstance.balanceOf.call(userSecond).then(function (result) {
                            // The users minted tokens - use toFixed to avoid miniscule rounding errors between js and solidity
                            var userSecondTokensTotal = parseFloat(web3.fromWei(result.valueOf())).toFixed(0);
                            // The amount of expected tokens - use toFixed to avoid differences in minute rounding errors between js and solidity
                            var expectedTokens = parseFloat(web3.fromWei(sendAmount / tokenPriceInEther, 'ether')).toFixed(0);
                            // Make sure the refund is correct and the user has the correct amount of tokens
                            return refund == 0 && userSecondTokensTotal == expectedTokens ? true : false;
                        }).then(function (result) {
                            assert.isTrue(result, "userSecond receives correct amount of tokens and no refund.");
                        });
                    }); 
                });
            });
        });
   }); // End Test 
    

    it(printTitle('userSecond', 'fails to deposit the same amount again'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                 // Get the amount that's allocated to the presale user
                return rocketPoolPresaleInstance.getPresaleAllocation.call(userSecond).then(function (result) {
                    // Send just a bit less than what we've been allocated
                    var sendAmount = result.valueOf();
                    // Transaction
                    return rocketPoolPresaleInstance.sendTransaction({ from: userSecond, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                        return result;
                    }).then(function(result) { 
                        assert(false, "Expect throw but didn't.");
                    }).catch(function (error) {
                        return checkThrow(error);
                    });
                });
            });
        });
    }); // End Test  


    
    it(printTitle('owner', 'verify userFirst and userSeconds tokens = the total minted overall'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Total user tokens
                var totalUserTokens = 0;
                // Get the token balance of their account now after withdrawing
                return rocketPoolTokenInstance.balanceOf.call(userFirst).then(function (result) {
                    // Add use - toFixed to avoid differences in minute rounding errors between js and solidity
                    totalUserTokens += Number(Number(web3.fromWei(result.valueOf(), 'ether')).toFixed(12));                   
                    // Get the token balance of their account now after withdrawing
                    return rocketPoolTokenInstance.balanceOf.call(userSecond).then(function (result) {
                        // Add - use toFixed to avoid differences in minute rounding errors between js and solidity
                        totalUserTokens += Number(Number(web3.fromWei(result.valueOf(), 'ether')).toFixed(12));   
                        // Get the total tokens minted according to the sale agent
                        return rocketPoolTokenInstance.getSaleContractTokensMinted.call(rocketPoolPresaleInstance.address).then(function (result) {
                            // Total minted by sale agent
                            var totalMintedSaleAgent = Number(parseFloat(web3.fromWei(result.valueOf(), 'ether')).toFixed(12));   
                            // Get the total tokens minted according to the main contract
                            return rocketPoolTokenInstance.totalSupply.call().then(function (result) {
                                // Total Supply
                                var totalSupply = Number(parseFloat(web3.fromWei(result.valueOf(), 'ether')).toFixed(12));   
                                //console.log(totalUserTokens);
                                //console.log(totalMintedSaleAgent);
                                //console.log(totalSupply);
                                return totalUserTokens == totalSupply && totalMintedSaleAgent == totalSupply && totalUserTokens == totalMintedSaleAgent ? true : false;
                            }).then(function (result) {
                                assert.isTrue(result, "token counts are correct.");
                            });
                        });
                    });
                });
            });
        });
    });   


    it(printTitle('userFirst', 'fails to finalise the presale as they are not depositAddress'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Get the contract details
                return rocketPoolPresaleInstance.finaliseFunding({ from: userFirst, to: rocketPoolPresaleInstance.address, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function(result) { 
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    });

        
    it(printTitle('depositAddress', 'finalises the presale and receives the ether'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Current ether in depositAddress account
                var depositAddressAccountBefore = Number(web3.eth.getBalance(saleContracts.presale.depositAddress));
                // Current ether in sale agent contract
                var saleAgentAccountBefore = Number(web3.eth.getBalance(rocketPoolPresaleInstance.address));
                // Get the balance of their account now after withdrawing
                return rocketPoolPresaleInstance.finaliseFunding({ from: saleContracts.presale.depositAddress, to: rocketPoolPresaleInstance.address, gas: 250000 }).then(function (result) {
                    // Balance after
                    var depositAddressAccountAfter = Number(web3.eth.getBalance(saleContracts.presale.depositAddress));
                    // Current ether in sale agent contract
                    var saleAgentAccountAfter = Number(web3.eth.getBalance(rocketPoolPresaleInstance.address));
                    // Check to see its actually finalised
                    return rocketPoolTokenInstance.getSaleContractIsFinalised.call(rocketPoolPresaleInstance.address).then(function (result) {
                        var isFinalised = result.valueOf();
                        // Check it all now
                        return isFinalised == true && saleAgentAccountAfter == 0;
                    }).then(function (result) {
                        assert.isTrue(result, "token counts are correct.");
                    });
                });
            });
        });
    });   


    it(printTitle('userThird', 'fails to deposit and receive their reserved tokens after presale is finalised'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                 // Get the amount that's allocated to the presale user
                return rocketPoolPresaleInstance.getPresaleAllocation.call(userThird).then(function (result) {
                    // Send what we've been allocated
                    var sendAmount = result.valueOf();
                    // Transaction
                    return rocketPoolPresaleInstance.sendTransaction({ from: userThird, value: sendAmount, gas: 350000 }).then(function (result) {
                        return result;
                    }).then(function(result) { 
                        assert(false, "Expect throw but didn't.");
                    }).catch(function (error) {
                        return checkThrow(error);
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



    

   
});



 


