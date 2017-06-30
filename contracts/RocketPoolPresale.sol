pragma solidity ^0.4.10;
import "./RocketPoolToken.sol";
import "./lib/Arithmetic.sol";

/// @title The main Rocket Pool Token (RPL) public presale contract
/// @author David Rugendyke


contract RocketPoolPresale is RocketPoolToken {

    /**** Properties ***********/

    // Presale Params
    uint256 public preSaleStartBlock;                   // When to start allowing presale deposits
    uint256 public preSaleEndBlock;                     // When to stop allowing presale deposits
    mapping (address => uint256) preSaleAllocations;    // Addresses which are accepted presale participants
 
    // Calculated values
    mapping (address => uint256) contributions;         // ETH contributed per address
    uint256 public contributedTotal;                    // Total ETH contributed TODO: Make private before deploying


    /*** Events ****************/

   
    event Contribute(address _sender, uint256 _value);
    event FinaliseSale(address _sender);
    event RefundContribution(address _sender, uint256 _value);
    event ClaimTokens(address _sender, uint256 _value);

    
    /**** Methods ***********/

    // Constructor
    /// @dev RPL Token Init
    /// @param _preSaleStartBlock The start block for the presale
    /// @param _preSaleEndBlock The end block for the presale
    function RocketPoolPresale(uint256 _preSaleStartBlock, uint256 _preSaleEndBlock) {
        // Presale start & end blocks
        preSaleStartBlock = _preSaleStartBlock;
        preSaleEndBlock = _preSaleEndBlock;
    }


   
}
