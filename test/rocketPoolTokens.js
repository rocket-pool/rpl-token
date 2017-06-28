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

// Start the token and crowdsale tests now
contract('RocketPoolToken', function (accounts) {

    // Our contributers    
    var owner = accounts[0];
    var userFirst = accounts[1];
    var userSecond = accounts[2];
    var userThird = accounts[2];

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


   
});


 


