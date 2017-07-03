pragma solidity ^0.4.10;
import "../RocketPoolToken.sol";
import "../interface/SalesContractInterface.sol";
import "../lib/Arithmetic.sol";


/// @title The main Rocket Pool Token (RPL) crowdsale contract
/// @author David Rugendyke - http://www.rocketpool.net

 // Tokens allocated proportionately to each sender according to amount of ETH contributed as a fraction of the total amount of ETH contributed by all senders.
 // credit for original distribution idea goes to hiddentao - https://github.com/hiddentao/ethereum-token-sales


contract RocketPoolCrowdsale is SalesContractInterface {

    // Constructor
    /// @dev Sale Agent Init
    /// @param _tokenContractAddress The main token contract address
    function RocketPoolCrowdsale(address _tokenContractAddress) {
        // Set the main token address
        tokenContractAddress = _tokenContractAddress;
    }

    /// @dev Returns the deposit address for this sales contract
    function getDepositAddress() public returns (address) {
        return this;
    }

    /// @dev Get the contribution total of ETH from a contributor
    /// @param _owner The owners address
    function getContributionOf(address _owner) constant returns (uint256 balance) {
        return contributions[_owner];
    }

    /// @dev Accepts ETH from a contributor, calls the parent token contract to mint tokens
    function() payable external { 
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Do some common contribution validation, will throw if an error occurs
        if(rocketPoolToken.validateContribution(msg.sender, msg.value)) {
            // Add to contributions
            contributions[msg.sender] += msg.value;
            contributedTotal += msg.value;
            // Fire event
            Contribute(msg.sender, msg.value); 
        }
    }


    /// @dev Finalises the funding and sends the ETH to deposit address
    function finaliseFunding() external {
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Do some common contribution validation, will throw if an error occurs
        if(rocketPoolToken.validateFinalising(msg.sender)) {
            // Send to deposit address - revert all state changes if it doesn't make it
            if (!rocketPoolToken.getSaleContractDepositAddress().send(targetEth)) throw;
            // Fire event
            FinaliseSale(msg.sender, targetEth);
        }
    }

    /// @dev Allows contributors to claim their tokens and/or a refund. If funding failed then they get back all their Ether, otherwise they get back any excess Ether
    function claimTokensAndRefund() external {
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Get the exponent used for this token
        uint256 exponent = rocketPoolToken.exponent();
        // Do some common contribution validation, will throw if an error occurs
        if(rocketPoolToken.validateContribution(msg.sender, msg.value)) {
            // The users contribution
            uint256 userContributionTotal = contributions[msg.sender];
            // Deduct the contribution now to protect against recursive calls
            contributions[msg.sender] = 0; 
            // Has the contributed total not been reached, but the crowdsale is over?
            if (contributedTotal < targetEth) {
                // Target wasn't met, refund the user
                if (!msg.sender.send(userContributionTotal)) throw;
                // Fire event
                RefundContribution(msg.sender, userContributionTotal);
            } else {
                // Calculate what percent of the ether raised came from me
                uint256 percEtherContributed = Arithmetic.overflowResistantFraction(userContributionTotal, rocketPoolToken.exponent, contributedTotal);
                // Calculate how many tokens I get, don't include the reserve left for RP
                rocketPoolToken.mint(msg.sender, Arithmetic.overflowResistantFraction(percEtherContributed, (totalSupply-tokenReserve), exponent));
                // Calculate the refund this user will receive
                if (!msg.sender.send(Arithmetic.overflowResistantFraction(percEtherContributed, (contributedTotal - targetEth), exponent))) throw;
                // Fire event
                ClaimTokens(msg.sender, rocketPoolToken.balanceOf[msg.sender]);
            }
        }
    }


    /*
    /// @dev Required for sales contracts that can be upgraded
    /// @param _upgradedSaleContractAddress The address of the new sales contract that will replace this one
    function upgrade(address _upgradedSaleContractAddress) onlyTokenContract public returns (bool) {
        // Move any funds collected to the new contract, new contract must have a default payable method to accept
        if(!_upgradedSaleContractAddress.call.value(this.balance)()) throw;
        // All good
        return true;
    }*/
}
