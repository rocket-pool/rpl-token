pragma solidity ^0.4.10;
import "../RocketPoolToken.sol";
import "../interface/SaleContractInterface.sol";
import "../lib/Arithmetic.sol";


/// @title The main Rocket Pool Token (RPL) crowdsale contract
/// @author David Rugendyke - http://www.rocketpool.net

 // Tokens allocated proportionately to each sender according to amount of ETH contributed as a fraction of the total amount of ETH contributed by all senders.
 // credit for original distribution idea goes to hiddentao - https://github.com/hiddentao/ethereum-token-sales


contract RocketPoolCrowdsale is SaleContractInterface {


    // Constructor
    /// @dev RPL Crowdsale Init
    /// @param _rplTokenAddress The main token contract address
    function RocketPoolCrowdsale(address _tokenContractAddress) {
        // Set the main token address
        tokenContractAddress = _tokenContractAddress;
    }

    /// @dev Required for sales contracts that can be upgraded
    /// @param _upgradedSaleContractAddress The address of the new sales contract that will replace this one
    function upgrade(address _upgradedSaleContractAddress) onlyTokenContract public returns (bool) {
        // Move any funds collected to the new contract, new contract must have a default payable method to accept
        if(!_upgradedSaleContractAddress.call.value(this.balance)()) throw;
        // All good
        return true;
    }

    
    /*
    
    /// @dev Accepts ETH from a contributor
    function() payable external { 
        // Did they send anything?
        assert(msg.value > 0);  
        // Check if we're ok to receive contributions, have we started?
        assert(block.number > fundingStartBlock);       
        // Already ended?
        assert(block.number < fundingEndBlock);        
        // Max sure the user has not exceeded their ether allocation
        assert((contributions[msg.sender] + msg.value) <= maxEthAllocation);              
        // Add to contributions
        contributions[msg.sender] += msg.value;
        contributedTotal += msg.value;
        // Fire event
        Contribute(msg.sender, msg.value); 
    }


    /// @dev Finalises the funding and sends the ETH to deposit address
    function finaliseFunding() external {
        // Finalise the crowdsale funds
        assert(!isFinalised);                       
        // Wrong sender?
        assert(msg.sender == depositAddress);            
        // Not yet finished?
        assert(block.number >= fundingEndBlock);         
        // Not enough raised?
        assert(contributedTotal >= targetEth);
        // We're done now
        isFinalised = true;
        // Assign the reserved RP tokens to the depositAddress account
        balances[depositAddress] = tokenReserve;
        // Send to deposit address - revert all state changes if it doesn't make it
        if (!depositAddress.send(targetEth)) throw;
        // Fire event
        FinaliseSale(msg.sender, targetEth, tokenReserve);
    }

    /// @dev Allows contributors to claim their tokens and/or a refund. If funding failed then they get back all their Ether, otherwise they get back any excess Ether
    function claimTokensAndRefund() external {
        // Must have previously contributed
        assert(contributions[msg.sender] > 0); 
        // Crowdfund completed
        assert(block.number >= fundingEndBlock);   
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
            // Get the token contract
            RocketPoolToken rocketPoolToken = RocketPoolToken(rplTokenAddress);
            // Calculate what percent of the ether raised came from me
            uint256 percEtherContributed = Arithmetic.overflowResistantFraction(userContributionTotal, exponent, contributedTotal);
            // Calculate how many tokens I get, don't include the reserve left for RP
            rocketPoolToken.mint(msg.sender, Arithmetic.overflowResistantFraction(percEtherContributed, (totalSupply-tokenReserve), exponent));
            // Calculate the refund this user will receive
            if (!msg.sender.send(Arithmetic.overflowResistantFraction(percEtherContributed, (contributedTotal - targetEth), exponent))) throw;
            // Fire event
            ClaimTokens(msg.sender, rocketPoolToken.balanceOf[msg.sender]);
        }
    }*/
}
