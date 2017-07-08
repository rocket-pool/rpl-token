pragma solidity ^0.4.10;
import "../RocketPoolToken.sol";
import "../base/SalesAgent.sol";


/// @title The main Rocket Pool Token (RPL) reserve fund contract, reserved tokens for future dev work, code/bug bounties, audits, security and more
/// @author David Rugendyke - http://www.rocketpool.net


contract RocketPoolReserveFund is SalesAgent {

    // Constructor
    /// @dev Sale Agent Init
    /// @param _tokenContractAddress The main token contract address
    function RocketPoolReserveFund(address _tokenContractAddress) {
        // Set the main token address
        tokenContractAddress = _tokenContractAddress;
    }

    /// @dev Allows RP to collect the reserved tokens
    function claimReserveTokens() external {
        // Get our main token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // The max tokens assigned to this sale agent contract is our reserve fund, mint these to our deposit address for this agent
        // Will throw if minting conditions are not met, ie depositAddressCheckedIn is false, sale has been finalised
        rocketPoolToken.mint(
            rocketPoolToken.getSaleContractDepositAddress(this),
            rocketPoolToken.getSaleContractTokensLimit(this)
        );
        // Finalise this sale, will verify the senders address, contribution amount and more - throws if basic finalisation settings are not met
        rocketPoolToken.setSaleContractFinalised(msg.sender);  
        // Fire the event
        ClaimTokens(msg.sender, rocketPoolToken.balanceOf(msg.sender));
    }

    
}
