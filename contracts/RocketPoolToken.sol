pragma solidity ^0.4.10;
import "./base/Owned.sol";
import "./base/StandardToken.sol";
import "./interface/SalesAgentInterface.sol";
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
    uint256 public totalSupplyMinted = 0;                   // The total of tokens currently minted by sales agent contracts                  
    
    
    /*** Sale Addresses *********/
       
    mapping (address => salesAgent) private salesAgents;   // Our contract addresses of our sales contracts 
    address[] private salesAgentsAddresses;                // Keep an array of all our sales agent addresses for iteration

    /*** Structs ***************/
             
    struct salesAgent {                     // These are contract addresses that are authorised to mint tokens
        address saleContractAddress;        // Address of the contract
        bytes32 saleContractType;           // Type of the contract ie. presale, crowdsale 
        uint256 targetEth;                  // The amount of ether to raise to consider this contracts sales completed
        uint256 maxTokens;                  // The maximum amount of tokens this sale contract is allowed to distribute
        uint256 startBlock;                 // The start block when allowed to mint tokens
        uint256 endBlock;                   // The end block when to finish minting tokens
        uint256 contributionLimit;          // The max ether amount per account that a user is able to pledge, passing 0 means unlimited
        address depositAddress;             // The address that receives the ether for that sale contract
        bool depositAddressCheckedIn;       // The address that receives the ether for that sale contract must check in with its sale contract to verify its a valid address that can interact
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
        assert(salesAgents[_sender].exists == true);
        _;
    }

    
    /**** Methods ***********/

    /// @dev RPL Token Init
    function RocketPoolToken() {
        
    }


    // @dev General validation for a sales agent contract receiving a contribution, additional validation can be done in the sale contract if required
    // @param _sender The address sent the contribution
    // @param _value The value of the contribution
    // @return A boolean that indicates if the operation was successful.
    function validateContribution(address _sender, uint256 _value) isSalesContract(msg.sender) returns (bool) {
        // Get an instance of the sale agent contract
        SalesAgentInterface saleAgent = SalesAgentInterface(msg.sender);
        // Did they send anything?
        assert(_value > 0);  
        // Check the depositAddress has been verified by the account holder
        assert(salesAgents[msg.sender].depositAddressCheckedIn == true);
        // Check if we're ok to receive contributions, have we started?
        assert(block.number > salesAgents[msg.sender].startBlock);       
        // Already ended?
        assert(block.number < salesAgents[msg.sender].endBlock);        
        // Max sure the user has not exceeded their ether allocation - setting 0 means unlimited
        if(salesAgents[msg.sender].contributionLimit > 0) {
            // Get the users contribution so far
            assert((saleAgent.getContributionOf(_sender) + _value) <= salesAgents[msg.sender].contributionLimit);   
        }
        // All good
        return true;
    }


    // @dev General validation for a sales agent contract to be finalised
    // @param _sender The address sent the request, should be the withdrawal
    // @return A boolean that indicates if the operation was successful.
    function validateFinalising(address _sender) isSalesContract(msg.sender) returns (bool) {
        // Get an instance of the sale agent contract
        SalesAgentInterface saleAgent = SalesAgentInterface(msg.sender);
        // Finalise the crowdsale funds
        assert(!salesAgents[msg.sender].finalised);                       
        // The address that will receive this contracts deposit, should match the original senders
        assert(salesAgents[msg.sender].depositAddress == _sender);            
        // Not yet finished?
        assert(block.number >= salesAgents[msg.sender].endBlock);         
        // Not enough raised?
        assert(saleAgent.contributedTotal() >= salesAgents[msg.sender].targetEth);
        // We're done now
        salesAgents[msg.sender].finalised = true;
        // All good
        return true;
    }


    // @dev General validation for a sales agent contract that requires the user claim the tokens after the sale has finished
    // @param _sender The address sent the request
    // @return A boolean that indicates if the operation was successful.
    function validateClaimTokens(address _sender) isSalesContract(msg.sender) returns (bool) {
        // Get an instance of the sale agent contract
        SalesAgentInterface saleAgent = SalesAgentInterface(msg.sender);
        // Must have previously contributed
        assert(saleAgent.getContributionOf(_sender) > 0); 
        // Sale contract completed
        assert(block.number >= salesAgents[msg.sender].endBlock);  
        // All good
        return true;
    }
    

    // @dev Mint the Rocket Pool Tokens (RPL)
    // @param _to The address that will receive the minted tokens.
    // @param _amount The amount of tokens to mint.
    // @return A boolean that indicates if the operation was successful.
    function mint(address _to, uint _amount) isSalesContract(msg.sender) returns (bool) {
        // Check the depositAddress has been verified by the account holder
        assert(salesAgents[msg.sender].depositAddressCheckedIn == true);
        // No minting if the sale contract has finalised
        assert(salesAgents[msg.sender].finalised == false);
        // Check if we're ok to mint new tokens, have we started?
        assert(block.number > salesAgents[msg.sender].startBlock);       
        // Has the sale period finished?
        assert(block.number < salesAgents[msg.sender].endBlock); 
        // Verify ok balances and values
        assert(_amount > 0 && (balances[_to] + _amount) > balances[_to]);
        // Check we don't exceed the supply limit
        assert((totalSupplyMinted + _amount) <= totalSupply);
        // Ok all good
        balances[_to] += _amount;
        // Add to the total minted
        totalSupplyMinted += _amount;
        // Fire the event
        mintToken(_to, _amount);
        // Completed
        return true; 
    }

    
    /// @dev Set the address of a new crowdsale/presale contract agent if needed, usefull for upgrading
    /// @param _saleAddress The address of the new token sale contract
    /// @param _saleContractType Type of the contract ie. presale, crowdsale, quarterly
    /// @param _targetEth The amount of ether to raise to consider this contracts sales completed
    /// @param _maxTokens The maximum amount of tokens this sale contract is allowed to distribute
    /// @param _startBlock The start block when allowed to mint tokens
    /// @param _endBlock The end block when to finish minting tokens
    /// @param _contributionLimit The max ether amount per account that a user is able to pledge, passing 0 means unlimited
    /// @param _depositAddress The address that receives the ether for that sale contract
    /// @param _upgradeExistingContractAddress The existing address that will be upgraded using the new supplied contract at _saleAddress
    function setSaleContract(
        address _saleAddress, 
         string _saleContractType, 
        uint256 _targetEth, 
        uint256 _maxTokens, 
        uint256 _startBlock, 
        uint256 _endBlock, 
        uint256 _contributionLimit, 
        address _depositAddress, 
        address _upgradeExistingContractAddress
    ) public onlyOwner  
    {
        if(_saleAddress != 0x0 && _depositAddress != 0x0) {
            // Are we upgrading a previously deployed contract?
            /* TODO: Make this safer by refunding users rather than transferring the ether to a new contract
            if(_upgradeExistingContractAddress != 0x0 && salesAgents[_upgradeExistingContractAddress].exists == true && salesAgents[_upgradeExistingContractAddress].finalised == false) {
                // The deployed contract must have a method called 'Upgrade' for this to work, will move funds to the new contract and perform any other upgrade actions
                SaleContractInterface saleContract = SaleContractInterface(_upgradeExistingContractAddress);
                // Only proceed if the upgrade works
                if(!saleContract.upgrade(_saleAddress)) throw;
            }
            */
            // Count all the tokens currently available through our agents
            uint256 currentAvailableTokens = 0;
            for(uint256 i=0; i < salesAgentsAddresses.length; i++) {
               currentAvailableTokens += salesAgents[salesAgentsAddresses[i]].maxTokens;
            }
            // If maxTokens is set to 0, it means assign the rest of the available tokens
            _maxTokens = _maxTokens <= 0 ? totalSupply - currentAvailableTokens : _maxTokens;
            // Can we cover this lot of tokens for the agent if they are all minted?
            assert(_maxTokens > 0 && totalSupply >= (currentAvailableTokens + _maxTokens));
            // Add the new sales contract
            salesAgents[_saleAddress] = salesAgent({
                saleContractAddress: _saleAddress,       
                saleContractType: sha3(_saleContractType),         
                targetEth: _targetEth,   
                maxTokens: _maxTokens,              
                startBlock: _startBlock,                 
                endBlock: _endBlock,  
                contributionLimit: _contributionLimit,                 
                depositAddress: _depositAddress, 
                depositAddressCheckedIn: false,  
                finalised: false,     
                exists: true                      
            });
            // Store our agent address so we can iterate over it if needed
            salesAgentsAddresses.push(_saleAddress);
        }else{
            throw;
        }
    }

    /// @dev Verifies if the current address matches the depositAddress
    /// @param _verifyAddress The address to verify it matches the depositAddress given for the sales agent
    function setSaleContractDepositAddressVerified(address _verifyAddress) isSalesContract(msg.sender) public  {
        // Check its verified
        assert(salesAgents[msg.sender].depositAddress == _verifyAddress && _verifyAddress != 0x0);
        // Ok set it now
        salesAgents[msg.sender].depositAddressCheckedIn = true;
    }

    /// @dev Fetch the main details of a crowdsale/presale contract
    /// @param _saleAddress The address of the new token sale contract
    function getSaleContract(address _saleAddress) isSalesContract(_saleAddress) public returns(uint256, uint256, uint256, uint256, uint256, address)  {
        // Return the sales contract struct as a tuple type
        return(
            salesAgents[_saleAddress].targetEth,
            salesAgents[_saleAddress].maxTokens,
            salesAgents[_saleAddress].startBlock,
            salesAgents[_saleAddress].endBlock,
            salesAgents[_saleAddress].contributionLimit,
            salesAgents[_saleAddress].depositAddress
        ); 
    }

    /// @dev Returns true if this sales contract has finalised
    function getSaleContractIsFinalised() isSalesContract(msg.sender) public returns(bool)  {
        return salesAgents[msg.sender].finalised;
    }

    /// @dev Returns the address where the sale contracts ether will be deposited
    function getSaleContractDepositAddress() isSalesContract(msg.sender) public returns(address)  {
        return salesAgents[msg.sender].depositAddress;
    }

    /// @dev Returns the start block for the sale agent
    function getSaleContractStartBlock() isSalesContract(msg.sender) public returns(uint256)  {
        return salesAgents[msg.sender].startBlock;
    }

    /// @dev Returns the start block for the sale agent
    function getSaleContractEndBlock() isSalesContract(msg.sender) public returns(uint256)  {
        return salesAgents[msg.sender].endBlock;
    }

    /// @dev Returns the max tokens for the sale agent
    function getSaleContractMaxTokens() isSalesContract(msg.sender) public returns(uint256)  {
        return salesAgents[msg.sender].maxTokens;
    }
    
}
