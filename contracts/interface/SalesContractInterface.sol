pragma solidity ^0.4.10;


/// @title An interface for token sales contracts (ie crowdsale, presale, quarterly sale etc)
/// @author David Rugendyke - http://www.rocketpool.net

contract SaleContractInterface {
     /**** Properties ***********/
    // Main contract token address
    address tokenContractAddress;
    /// @dev Only allow access from the main token contract
    modifier onlyTokenContract() {
        // Is this an authorised sale contract?
        assert(msg.sender == tokenContractAddress);
        _;
    }
    /*** Events ****************/
    event Contribute(address _sender, uint256 _value);
    event FinaliseSale(address _sender, uint256 _value, uint256 _tokens);
    event RefundContribution(address _sender, uint256 _value);
    event ClaimTokens(address _sender, uint256 _value); 
    /*** Methods ****************/
    /// @dev A method for upgrading this sales contract
    function upgrade(address _upgradedSaleContractAddress) onlyTokenContract public returns (bool);
}