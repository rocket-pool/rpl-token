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
contract('RocketPoolCrowdsale', function (accounts) {

    // Set our crowdsale units
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
        'crowdsale': {
            // What the sale is aiming for 
            targetEth: 0,
            // Maximum tokens the contract can distribute 
            maxTokens: 0,
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


    // Load our crowdsale contract settings
    it(printTitle('contractCrowdsale', 'load crowdsale contract settings'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the contract details
                return rocketPoolTokenInstance.getSaleContract.call(rocketPoolCrowdsaleInstance.address).then(function(result) {
                    var salesContract = result.valueOf();
                    //console.log(salesContract);
                    saleContracts.crowdsale.targetEth = salesContract[0];
                    saleContracts.crowdsale.maxTokens = salesContract[1];
                    saleContracts.crowdsale.fundingStartBlock = salesContract[2];
                    saleContracts.crowdsale.fundingEndBlock = salesContract[3];
                    saleContracts.crowdsale.contributionLimit = salesContract[4];
                    saleContracts.crowdsale.depositAddress = salesContract[5];
                    //console.log(saleContracts.crowdsale);
                });
            });
        });
    });   

    

    /*** Tests Start ***********************************/    


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
    

    // Block 5 should have been reached now for the start of the crowdfund
    it(printTitle('userFirst', 'fails to deposit by sending more than the maxEthAllocation will allow per account'), function () {
        // Token contract   
        return rocketPoolToken.deployed().then(function (rocketPoolTokenInstance) {
            // Crowdsale contract   
            return rocketPoolCrowdsale.deployed().then(function (rocketPoolCrowdsaleInstance) {
                // Get the max ether per account
                return rocketPoolTokenInstance.getSaleContractTargetEther.call(rocketPoolCrowdsaleInstance.address).then(function (result) {
                    // Contribute amount = 1 ether more than allowed
                    var sendAmount = parseInt(web3.toWei('1', 'ether')) + parseInt(result.valueOf());
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


    

    
   
   
});



 


