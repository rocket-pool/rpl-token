pragma solidity ^0.4.10;
import "./base/Owned.sol";
import "./base/StandardToken.sol";
import "./interface/SaleContractInterface.sol";
import "./lib/Arithmetic.sol";

/// @title The main Rocket Pool Token (RPL) contract
/// @author David Rugendyke - http://www.rocketpool.net

contract RocketPoolToken is StandardToken, Owned {

     /**** Properties ***********/

    string public name = 'Rocket Pool Token';
    string public symbol = 'RPL';
    string public version = "1.0";
    // Set our token units
    uint256 public constant decimals = 18;
    uint256 public exponent = 10**decimals;
    uint256 public totalSupply = 50 * (10**6) * exponent;   // 50 Million tokens
    uint256 public targetEth;                               // Target ETH to raise across all sales contracts                        
    uint256 public tokenReserve;                            // The amount of tokens in perc reserved for RP future work
    uint256 public tokenReservePerc;                        // How much % of the overall crowdsale is assigned for the presale - given as % of 1 Ether (eg 15% = 0.15 Ether)
    mapping (address => uint256) public contributions;      // Contributions per address   
    uint256 public contributedTotal;                        // Total ETH contributed

    /*** Sale Addresses *********/
       
    mapping (address => salesAddress) private salesAddresses;   // Our contract addresses of our sales contracts 

    /*** Structs ***************/
             
    struct salesAddress {                   // These are contract addresses that are authorised to mint tokens
        address saleContractAddress;        // Address of the contract
        bytes32 saleContractType;           // Type of the contract ie. presale, crowdsale 
        uint256 targetEth;                  // The amount of ether to raise to consider this contracts sales completed
        uint256 startBlock;                 // The start block when allowed to mint tokens
        uint256 endBlock;                   // The end block when to finish minting tokens
        uint256 contributionLimit;          // The max ether amount per account that a user is able to pledge, passing 0 means unlimited
        address depositAddress;             // The address that receives the ether for that sale contract
        bool finalised;                     // Has this sales contract been completed and the ether sent to the deposit address?
        bool exists;                        // Check to see if the mapping exists
    }

    /*** Events ****************/

    event mintToken(address _address, uint256 _value);
  
    /*** Tests *****************/

    event FlagUint(uint256 flag);
    event FlagAddress(address flag);

    
    /*** Modifiers *************/

    /// @dev Only allow access from the latest version of a sales contract
    modifier isSalesContract(address _sender) {
        // Is this an authorised sale contract?
        assert(salesAddresses[_sender].exists == true);
        _;
    }

    
    /**** Methods ***********/

    /// @dev RPL Token Init
    function RocketPoolToken() {
        // Set the token reserve percentage - given as % of 1 Ether
        tokenReservePerc = 0.15 ether;
        // Our token reserve amount
        tokenReserve = Arithmetic.overflowResistantFraction(tokenReservePerc, totalSupply, exponent);
    }


    // @dev Mint the Rocket Pool Tokens (RPL)
    // @param _to The address that will recieve the minted tokens.
    // @param _amount The amount of tokens to mint.
    // @return A boolean that indicates if the operation was successful.
    function mint(address _to, uint _amount) isSalesContract(msg.sender) returns (bool) {
        // No minting if the sale contract has finalised
        assert(salesAddresses[msg.sender].finalised == false);
        // Check if we're ok to mint new tokens, have we started?
        assert(block.number > salesAddresses[msg.sender].startBlock);       
        // Has the sale period finished?
        assert(block.number < salesAddresses[msg.sender].endBlock); 
        // Verify ok balances and values
        assert(_amount > 0 && (balances[_to] + _amount) > balances[_to]);
        // Ok all good
        balances[_to] += _amount;
        // Fire the event
        mintToken(_to, _amount);
        // Completed
        return true; 
    }


    /// @dev Set the address of a new crowdsale/presale contract if needed, usefull for upgrading
    /// @param _saleAddress The address of the new token sale contract
    /// @param _saleContractType Type of the contract ie. presale, crowdsale, quarterly
    /// @param _targetEth The amount of ether to raise to consider this contracts sales completed
    /// @param _startBlock The start block when allowed to mint tokens
    /// @param _endBlock The end block when to finish minting tokens
    /// @param _contributionLimit The max ether amount per account that a user is able to pledge, passing 0 means unlimited
    /// @param _depositAddress The address that receives the ether for that sale contract
    function setSaleContract(address _saleAddress, string _saleContractType, uint256 _targetEth, uint256 _startBlock, uint256 _endBlock, uint256 _contributionLimit, address _depositAddress, bool _isUpgrade) public onlyOwner  {
        if(_saleAddress != 0x0) {
            // Are we upgrading a previously deployed contract?
            if(_isUpgrade == true && salesAddresses[_saleAddress].exists == true && salesAddresses[_saleAddress].finalised == false) {
                // The deployed contract must have a method called 'Upgrade' for this to work, will move funds to the new contract and perform any other upgrade actions
                SaleContractInterface saleContract = SaleContractInterface(_saleAddress);
                // Only proceed if the upgrade works
                if(!saleContract.upgrade()) throw;
            }
            // Add the new sales contract
            salesAddresses[_saleAddress] = salesAddress({
                saleContractAddress: _saleAddress,       
                saleContractType: sha3(_saleContractType),         
                targetEth: _targetEth,                 
                startBlock: _startBlock,                 
                endBlock: _endBlock,  
                contributionLimit: _contributionLimit,                 
                depositAddress: _depositAddress,   
                finalised: false,     
                exists: true                      
            });
        }
    }

    /// @dev Fetch the main details of a crowdsale/presale contract
    /// @param _saleAddress The address of the new token sale contract
    function getSaleContract(address _saleAddress) isSalesContract(_saleAddress) public returns(bytes32, uint256, uint256, uint256, uint256, address)  {
        // Return the sales contract struct as a tuple type
        return(
            salesAddresses[_saleAddress].saleContractType,
            salesAddresses[_saleAddress].targetEth,
            salesAddresses[_saleAddress].startBlock,
            salesAddresses[_saleAddress].endBlock,
            salesAddresses[_saleAddress].contributionLimit,
            salesAddresses[_saleAddress].depositAddress
        ); 
    }

    /// @dev Returns true if this sales contract has finalised
    /// @param _saleAddress The address of the token sale contract
    function getSaleContractIsFinalised(address _saleAddress) isSalesContract(_saleAddress) public returns(bool)  {
        return salesAddresses[_saleAddress].finalised;
    }

    /// @dev Get the contribution total of ETH from a contributor
    /// @param _owner The owners address
    function contributionOf(address _owner) constant returns (uint256 balance) {
        return contributions[_owner];
    }

    
}
