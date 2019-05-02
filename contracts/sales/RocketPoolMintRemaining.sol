pragma solidity ^0.4.11;
import "../RocketPoolToken.sol";
import "../base/SalesAgent.sol";


/// @title A contract to mint remaining RPL up to the cap @ 18mil
/// @author David Rugendyke - http://www.rocketpool.net


contract RocketPoolMintRemaining is SalesAgent {

    // Constructor
    /// @dev Sale Agent Init
    /// @param _tokenContractAddress The main token contract address
    function RocketPoolMintRemaining(address _tokenContractAddress) {
        // Set the main token address
        tokenContractAddress = _tokenContractAddress;
    }

    /// @dev Claim RPL left over from users not collecting in the Crowdsale and from rounding
    function claimRemainingRPL() external {
        // Get our main token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Mint all remaining tokens up to 18mil
        rocketPoolToken.mint(
            rocketPoolToken.getSaleContractDepositAddress(this),
            rocketPoolToken.getRemainingTokens()
        );
        // Finalise this sale, will verify the senders address, contribution amount and more - 
        // Throws if basic finalisation settings are not met and msg.sender must be the depositAddress asigned for the sale agent
        rocketPoolToken.setSaleContractFinalised(msg.sender);  
        // Fire the event
        ClaimTokens(this, rocketPoolToken.getSaleContractDepositAddress(this), rocketPoolToken.balanceOf(rocketPoolToken.getSaleContractDepositAddress(this)));
    }

    
}
