pragma solidity ^0.4.10;


/// @title An interface for token sales contracts (ie crowdsale, presale, quarterly sale etc)
/// @author David Rugendyke - http://www.rocketpool.net

contract SalesContractInterface {
     /**** Properties ***********/
    // Main contract token address
    address tokenContractAddress;
    // The target amount of ether to raise for this sales contract
    uint256 targetEth;
    // Contributions per address
    mapping (address => uint256) public contributions;    
    // Total ETH contributed     
    uint256 public contributedTotal;                       
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
    /// @dev The address used for the depositAddress must checkin with the contract to verify it can interact with this contract, must happen or it won't accept funds
    function getDepositAddressVerify() public;
    /// @dev Returns the address of the contract to use for accepting deposits, should always be called before showing the address to users for depositing
    function getDepositAddress() public returns (address);
    /// @dev Get the contribution total of ETH from a contributor
    /// @param _owner The owners address
    function getContributionOf(address _owner) constant returns (uint256 balance);
    /// @dev A method for upgrading this sales contract
    function upgrade(address _upgradedSaleContractAddress) onlyTokenContract public returns (bool);
}