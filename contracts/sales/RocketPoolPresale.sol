pragma solidity ^0.4.10;
import "../RocketPoolToken.sol";
import "../base/SalesAgent.sol";
import "../lib/Arithmetic.sol";


/// @title The main Rocket Pool Token (RPL) presale contract
/// @author David Rugendyke - http://www.rocketpool.net

/*****************************************************************
*   This is the Rocket Pool presale sale agent contract. It mints
*   tokens from the main erc20 token instantly when payment is made
*   by a presale buyer. The value of each token is determined by
*   the sale agent parameters maxTargetEth / tokensLimit. If a 
*   buyer sends more ether than they are allocated, they receive
*   their tokens + a refund. The sale ends when the end block
*   is passed.
/****************************************************************/

contract RocketPoolPresale is SalesAgent  {

    /**** Properties ***********/

    // Our rocket mini pools, should persist between any Rocket Pool contract upgrades
    mapping (address => Allocations) private allocations;
    // Keep an array of all our addresses for iteration
    address[] private reservedAllocations;

    /**** Structs **************/

    struct Allocations {
        uint256 amount;                 // Amount in Wei they have been assigned
        bool exists;                    // Does this entry exist? (whoa, deep)
    }


    /**** Modifiers ***********/

    /// @dev Only allow access from a presale user
    modifier onlyPresaleUser(address _address) {
        assert(allocations[_address].exists == true);
        _;
    }


    // Constructor
    /// @dev Sale Agent Init
    /// @param _tokenContractAddress The main token contract address
    function RocketPoolPresale(address _tokenContractAddress) {
        // Set the main token address
        tokenContractAddress = _tokenContractAddress;
        // The presale addresses and reserved amounts, if a presale user does not buy all their tokens, they roll into the public crowdsale which follows this one
        // NOTE: If your testing with testrpc, you'll need to add the accounts in here that it generates for the second and third user eg accounts[1], accounts[2], accounts[3] if running the unit tests
        addPresaleAllocation(0x7a7ba7e66aaf422ecd8823366fbf9b80a1e6b7cf, 2 ether);
        addPresaleAllocation(0x99bd79722fe852ad1cfb5b506fedc84237d1e9ea, 1 ether);
        addPresaleAllocation(0xcda6fad8c86a49d4782db732dc5cfa9de1207585, 0.5 ether);
    }


    /// @dev Add a presale user
    function addPresaleAllocation(address _address, uint256 _amount) private {
        // Add the user and their allocation amount in Wei
        allocations[_address] = Allocations({
            amount: _amount,
            exists: true 
        }); 
        // Store our address so we can iterate over it if needed
        reservedAllocations.push(_address);
    }

    /// @dev Get a presale users ether allocation
    function getPresaleAllocation(address _address) public onlyPresaleUser(_address) returns(uint256) {
        // Get the users assigned amount
        return allocations[_address].amount;
    }


    /// @dev Accepts ETH from a contributor, calls the parent token contract to mint tokens
    function createTokens() payable public onlyPresaleUser(msg.sender) { 
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Do some common contribution validation, will throw if an error occurs
        if(rocketPoolToken.validateContribution(msg.sender, msg.value)) {
            // Have they already collected their reserved amount?
            assert(contributions[msg.sender] == 0);
            // Have they deposited enough to cover their reserved amount?
            assert(msg.value >= allocations[msg.sender].amount);
            // Add to contributions
            contributions[msg.sender] += msg.value;
            contributedTotal += msg.value;
            // Fire event
            Contribute(this, msg.sender, msg.value); 
            // Mint the tokens now for that user instantly
            mintSendTokens();
        }
    }


    /// @dev Mint the tokens now for that user instantly
    function mintSendTokens() private {
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Get the exponent used for this token
        uint256 exponent = rocketPoolToken.exponent();
        // If the user sent too much ether, calculate the refund
        uint256 refundAmount = int256(contributions[msg.sender] - allocations[msg.sender].amount) > 0 ? contributions[msg.sender] - allocations[msg.sender].amount : 0;    
        // Send the refund, throw if it doesn't succeed
        if (refundAmount > 0) {
            // Avoid recursion calls and deduct now
            contributions[msg.sender] -= refundAmount;
            contributedTotal -= refundAmount;
            // Send the refund, throw if it doesn't succeed
            if(!msg.sender.send(refundAmount)) throw;
            // Fire event
            Refund(this, msg.sender, refundAmount); 
        } 
        // Max tokens allocated to this sale agent contract
        uint256 totalTokens = rocketPoolToken.getSaleContractTokensLimit(this);
        // Note: There's a bug in testrpc currently which will deduct the msg.value twice from the user when calling any library function such as below (https://github.com/ethereumjs/testrpc/issues/122)
        //       Testnet and mainnet work as expected
        // Calculate the ether price of each token using the target max Eth and total tokens available for this agent, so tokenPrice = maxTargetEth / totalTokensForSale
        uint256 tokenPrice = Arithmetic.overflowResistantFraction(rocketPoolToken.getSaleContractTargetEtherMax(this), exponent, totalTokens);
        // Total tokens they will receive
        uint256 tokenAmountToMint = Arithmetic.overflowResistantFraction(allocations[msg.sender].amount, exponent, tokenPrice);
        // Mint the tokens and give them to the user now
        rocketPoolToken.mint(msg.sender, tokenAmountToMint);
        
        /*
        FlagUint(refundAmount);
        FlagUint(contributions[msg.sender]);
        FlagUint(tokenPrice);
        FlagUint(tokenAmountToMint);
        */
         
    }


    /// @dev Finalises the funding and sends the ETH to deposit address
    function finaliseFunding() external {
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Do some common contribution validation, will throw if an error occurs - address calling this should match the deposit address
        if(rocketPoolToken.setSaleContractFinalised(msg.sender)) {
            // Send to deposit address - revert all state changes if it doesn't make it
            if (!rocketPoolToken.getSaleContractDepositAddress(this).send(this.balance)) throw;
            // Fire event
            FinaliseSale(this, msg.sender, this.balance);
        }
    }



}
