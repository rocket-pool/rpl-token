pragma solidity ^0.4.10;
import "./base/StandardToken.sol";

/// @title The main Rocket Pool Token (RPL) contract
/// @author David Rugendyke

contract RocketPoolToken is StandardToken {

     /**** Properties ***********/

    string public name = 'Rocket Pool Token';
    string public symbol = 'RPL';
    string public version = "1.0";
    // Set our token units
    uint256 public constant decimals = 18;
    uint256 public exponent;
    // 50 Million tokens
    uint256 public totalSupply;   
    // Deposit address for ETH for ICO owner
    address public depositAddress;              

    /*** Events ****************/

    event CreateRPLToken(string _name); 
  
    /*** Tests *****************/

    event FlagUint(uint256 flag);
    event FlagAddress(address flag);

    
    /**** Methods ***********/

    /// @dev RPL Token Init
    function RocketPoolToken() {
        // Set our main units
        exponent = 10**decimals;
        // 50 Million tokens
        totalSupply = 50 * (10**6) * exponent;  
        // Fire event
        CreateRPLToken(name);
    }

    
}
