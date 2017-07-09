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
            // Max ether allowed per account
            contributionLimit: 0,
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
                                    return rocketPoolTokenInstance.getSaleContractContributionLimit.call(rocketPoolPresaleInstance.address).then(function(result) {
                                        saleContracts.presale.contributionLimit = result.valueOf();
                                        return rocketPoolTokenInstance.getSaleContractDepositAddress.call(rocketPoolPresaleInstance.address).then(function(result) {
                                            saleContracts.presale.depositAddress = result.valueOf();
                                            // Set the token price in ether now - maxTargetEth / tokensLimit
                                            tokenPriceInEther = saleContracts.presale.targetEthMax / saleContracts.presale.tokensLimit;
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


    /*** Tests Start ***********************************/  

     it(printTitle('owner/depositAddress', 'fail to deposit without depositAddress being verified with sale agent'), function () {
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


    it(printTitle('owner/depositAddress', 'verify depositAddress with sale agent'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Get the contract details
                return rocketPoolPresaleInstance.setDepositAddressVerify({ from: owner, gas: 250000 }).then(function (result) {
                    // Token contract, verify our reservefund contract has been verified   
                    return rocketPoolTokenInstance.getSaleContractDepositAddressVerified.call(rocketPoolPresaleInstance.address, { from: owner }).then(function (result) {
                        var verified = result.valueOf();
                        return verified == true;
                    }).then(function (result) {
                        assert.isTrue(result, "rocketPoolPresaleInstance depositAddress verified.");
                    });    
                });
            });
        });
    });   


    it(printTitle('userFourth', 'fails to deposit ether as he\'s not part of the presale'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.createTokens({ from: userFourth, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function(result) { 
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test    


    // Just testing atm
    it(printTitle('userFirst', 'deposits more ether than he\'s allocated, receives all his tokens and a refund'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = web3.toWei('5', 'ether');
                var userBalance = web3.eth.getBalance(userFirst).valueOf();
                var contractBalance = web3.eth.getBalance(rocketPoolPresaleInstance.address).valueOf();
                // Get the amount that's allocated to the presale user
                return rocketPoolPresaleInstance.getPresaleAllocation.call(userFirst).then(function (result) {
                    // Get the amount
                    var presaleEtherAllocation = result.valueOf();
                    // Transaction
                    return rocketPoolPresaleInstance.createTokens({ from: userFirst, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
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
                            var userFirstTokens = parseFloat(web3.fromWei(result.valueOf())).toFixed(6);
                            // The amount of expected tokens - use parseInt to avoid differences in minute rounding errors between js and solidity
                            var expectedTokens = parseFloat(web3.fromWei(presaleEtherAllocation / tokenPriceInEther, 'ether')).toFixed(6);
                            //console.log(refund);
                            //console.log((sendAmount - presaleEtherAllocation));
                            //console.log(userFirstTokens);
                            //console.log(expectedTokens);
                            // Make sure the refund is correct and the user has the correct amount of tokens
                            return refund == (sendAmount - presaleEtherAllocation) && userFirstTokens == expectedTokens;
                        }).then(function (result) {
                            assert.isTrue(result, "rocketPoolPresaleInstance depositAddress verified.");
                        });
                    }); 
                });
            });
        });
    }); // End Test    

    return;

    /*
    // Begin Tests
    it(printTitle('userFirst', 'fails to deposit before the presale begins'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount
                var sendAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.sendTransaction({ from: userFirst, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return result;
                }).then(function (result) {
                    assert(false, "Expect throw but didn't.");
                }).catch(function (error) {
                    return checkThrow(error);
                });
            });
        });
    }); // End Test  
    
    return;


    it(printTitle('userFirst', 'fails to deposit by sending more than the maxEthAllocation will allow per account'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // presale contract   
            return rocketPoolPresale.deployed().then(function (rocketPoolPresaleInstance) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = web3.toWei('1', 'ether');
                // Transaction
                return rocketPoolPresaleInstance.sendTransaction({ from: userFirst, to: rocketPoolPresaleInstance.address, value: sendAmount, gas: 250000 }).then(function (result) {
                    return false;
                    return result;
                }).then(function (result) {
                    assert.isTrue(result, "rocketPoolPresaleInstance depositAddress verified.");
                });  
            });
        });
    }); // End Test    

    */
    

   
});



 


