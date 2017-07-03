pragma solidity ^0.4.10;
import "../RocketPoolToken.sol";
import "../interface/SalesContractInterface.sol";
import "../lib/Arithmetic.sol";


/// @title The main Rocket Pool Token (RPL) reserve fund contract, reserved tokens for future dev work, code/bug bounties, audits, security and more
/// @author David Rugendyke - http://www.rocketpool.net


contract RocketPoolReserveFund is SalesContractInterface {

    // Constructor
    /// @dev Sale Agent Init
    /// @param _tokenContractAddress The main token contract address
    function RocketPoolReserveFund(address _tokenContractAddress) {
        // Set the main token address
        tokenContractAddress = _tokenContractAddress;
    }

    /// @dev The address used for the depositAddress must checkin with the contract to verify it can interact with this contract, must happen or it won't accept funds
    function getDepositAddressVerify() public {
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Is it the right address? Will throw if incorrect
        rocketPoolToken.setSaleContractDepositAddressVerified(msg.sender);
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
        ClaimTokens(msg.sender, rocketPoolToken.balanceOf[msg.sender]);
    }

    
}
