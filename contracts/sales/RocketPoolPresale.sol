pragma solidity ^0.4.10;
import "../RocketPoolToken.sol";
import "../base/SalesAgent.sol";
import "../lib/Arithmetic.sol";


/// @title The main Rocket Pool Token (RPL) presale contract - mints new tokens instantly for reserved buyers once payment is made
/// @author David Rugendyke - http://www.rocketpool.net


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


    // Constructor
    /// @dev Sale Agent Init
    /// @param _tokenContractAddress The main token contract address
    function RocketPoolPresale(address _tokenContractAddress) {
        // Set the main token address
        tokenContractAddress = _tokenContractAddress;
        // The presale addresses and reserved amounts, if a presale user does not buy all their tokens, they roll into the public crowdsale which follows this one
        // Note: If your testing with testrpc, you'll need to add the accounts in here that it generates for the second and third user eg accounts[1], accounts[2]
        addPresaleAllocation(0xbbb3c907236b94af11571fa418a2fe66f7bd0208, 2 ether);
        addPresaleAllocation(0x6779f6d40f875fb08367d8ecf7f052ca4c71d286, 1 ether);
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


    /// @dev Accepts ETH from a contributor, calls the parent token contract to mint tokens
    function() payable external { 
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // First check they are part of the presale
        assert(allocations[msg.sender].exists == true);
        // Do some common contribution validation, will throw if an error occurs
        if(rocketPoolToken.validateContribution(msg.sender, msg.value)) {
            // Have they already collected their reserved amount?
            assert(contributions[msg.sender] < allocations[msg.sender].amount);
            // Add to contributions
            contributions[msg.sender] += msg.value;
            contributedTotal += msg.value;
            // Fire event
            Contribute(msg.sender, msg.value); 
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
        FlagUint(contributions[msg.sender]);
        FlagUint(allocations[msg.sender].amount);
        FlagUint(refundAmount);
        // Update their cointribution amount
        contributions[msg.sender] -= refundAmount;
        contributedTotal -= refundAmount;
        // Send the refund, throw if it doesn't succeed
        // if (!msg.sender.send(refundAmount)) throw;
        
        // Max tokens allocated to this sale agent contract
        uint256 totalTokens = rocketPoolToken.getSaleContractTokensLimit(this);
        // Calculate the price of each token using the target Eth and total tokens
        uint256 tokenPrice = Arithmetic.overflowResistantFraction(rocketPoolToken.getSaleContractTargetEther(this), exponent, totalTokens);

        FlagUint(refundAmount);
        FlagUint(totalTokens);
        FlagUint(tokenPrice);
        // Calculate how many tokens to send
        //uint256 tokenAmountToMint = 
    }


    /// @dev Finalises the funding and sends the ETH to deposit address
    function finaliseFunding() external {
        // Get the token contract
        RocketPoolToken rocketPoolToken = RocketPoolToken(tokenContractAddress);
        // Do some common contribution validation, will throw if an error occurs - address calling this should match the deposit address
        if(rocketPoolToken.setSaleContractFinalised(msg.sender)) {
            // Send to deposit address - revert all state changes if it doesn't make it
            // if (!rocketPoolToken.getSaleContractDepositAddress(this).send(targetEth)) throw;
            // Fire event
            //FinaliseSale(msg.sender, targetEth);
        }
    }



}
