var rocketPoolToken = artifacts.require("./contract/RocketPoolToken.sol");

var displayEvents = false;

// Display events triggered during the tests
if(displayEvents) {
    rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
        var eventWatch = rocketPoolTokenInstance.allEvents({
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
contract('RocketPoolToken', function (accounts) {

    // Our contributers    
    var owner = accounts[0];
    var userFirst = accounts[1];
    var userSecond = accounts[2];
    var userThird = accounts[3];
    var userFourth = accounts[4];


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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1', 'ether'); 
            // Transaction
            return rocketPoolTokenInstance.sendTransaction({ from: userFirst, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Get the max ether per account
            return rocketPoolTokenInstance.maxEthAllocation.call().then(function (result) {
                // Contribute amount = 1 ether more than allowed
                var sendAmount = parseInt(web3.toWei('1', 'ether')) + parseInt(result.valueOf());
                // Transaction
                return rocketPoolTokenInstance.sendTransaction({ from: userFirst, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1', 'ether'); 
            // Transaction
            return rocketPoolTokenInstance.sendTransaction({ from: userFirst, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contrubution balance of their account now
                return rocketPoolTokenInstance.contributionOf.call(userFirst).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                });
            }).then(function (result) {
                assert.isTrue(result, "Contribution made successfully.");
            }); 
        });    
    }); // End Test 


    it(printTitle('depositAddress', 'fails to call finaliseFunding successfully while crowdsale is running'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Get the max ether per account
            return rocketPoolTokenInstance.finaliseFunding({ from: web3.eth.coinbase, to: rocketPoolTokenInstance.address, gas: 250000 }).then(function (result) {
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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Get the max ether per account
            return rocketPoolTokenInstance.maxEthAllocation.call().then(function (result) {
                // Contribute amount
                var sendAmount = parseInt(web3.toWei('10', 'ether')) + parseInt(result.valueOf());
                // Transaction
                return rocketPoolTokenInstance.sendTransaction({ from: userFirst, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Get the contrubution balance of their account now
            return rocketPoolTokenInstance.contributionOf.call(userFirst).then(function (result) {
                // His contrbutions so far
                var userFirstContributionTotal = parseInt(result.valueOf());
                // Get the max ether per account
                return rocketPoolTokenInstance.maxEthAllocation.call().then(function (result) {
                    var maxEthAllocation = parseInt(result.valueOf());
                    // Contribute the exact amount needed to set it at the per account threshold
                    var sendAmount = maxEthAllocation - userFirstContributionTotal; 
                    // Transaction
                    return rocketPoolTokenInstance.sendTransaction({ from: userFirst, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                        // Get the contrubution balance of their account now
                        return rocketPoolTokenInstance.contributionOf.call(userFirst).then(function (result) {
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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Contribute amount
            var sendAmount = parseInt(web3.toWei('1', 'ether'));
            // Transaction
            return rocketPoolTokenInstance.sendTransaction({ from: userFirst, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Get the max ether per account
            return rocketPoolTokenInstance.maxEthAllocation.call().then(function (result) {
                // Contribute amount
                var sendAmount = parseInt(result.valueOf());
                // Transaction
                return rocketPoolTokenInstance.sendTransaction({ from: userSecond, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                    // Get the contrubution balance of their account now
                    return rocketPoolTokenInstance.contributionOf.call(userSecond).then(function (result) {
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
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('1.33333945012327895', 'ether');
            // Transaction
            return rocketPoolTokenInstance.sendTransaction({ from: userThird, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contrubution balance of their account now
                return rocketPoolTokenInstance.contributionOf.call(userThird).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 


    it(printTitle('userFourth', 'makes successful deposit to crowdsale of 0.5 ether'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('0.5', 'ether');
            // Transaction
            return rocketPoolTokenInstance.sendTransaction({ from: userFourth, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contrubution balance of their account now
                return rocketPoolTokenInstance.contributionOf.call(userFourth).then(function (result) {
                    return result.valueOf() == sendAmount ? true : false;
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test 

    // ******* Crowdsale hits block < 14, closes **************

    it(printTitle('userFourth', 'makes successful deposit to crowdsale of 0.5 ether'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('0.5', 'ether');
            // Transaction
            return rocketPoolTokenInstance.sendTransaction({ from: userFourth, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                // Get the contrubution balance of their account now
                return rocketPoolTokenInstance.contributionOf.call(userFourth).then(function (result) {
                    return result.valueOf() == sendAmount*2 ? true : false;
                }).then(function (result) {
                    assert.isTrue(result, "Contribution made successfully.");
                });
            });
        });    
    }); // End Test   

    // ******* Crowdsale hits block 14, closes **************

    it(printTitle('userFourth', 'fails to make deposit to crowdsale of 0.5 ether as crowdsale end block is hit'), function () {
        // Check RocketHub is deployed first    
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Contribute amount
            var sendAmount = web3.toWei('0.5', 'ether');
            // Transaction
            return rocketPoolTokenInstance.sendTransaction({ from: userFourth, to: rocketPoolTokenInstance.address, value: sendAmount, gas: 250000 }).then(function(result) {
                   return result;
            }).then(function(result) { 
            assert(false, "Expect throw but didn't.");
            }).catch(function (error) {
                return checkThrow(error);
            });
        });    
    }); // End Test     

    

   
});



 


