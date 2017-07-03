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
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Check this is called by our depositAddress
        assert(rocketPoolToken.getSaleContractDepositAddress() == msg.sender);
        // The max tokens assigned to this sale agent contract is our reserve fund, mint these to our deposit address for this agent
        rocketPoolToken.mint(
            rocketPoolToken.getSaleContractDepositAddress(),
            rocketPoolToken.getSaleContractMaxTokens()
        );
        // Fire the event
        ClaimTokens(msg.sender, rocketPoolToken.balanceOf(msg.sender));
    }

    
}
