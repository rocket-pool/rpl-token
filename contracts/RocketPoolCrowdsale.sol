pragma solidity ^0.4.10;
import "./RocketPoolToken.sol";
import "./lib/Arithmetic.sol";

/// @title The main Rocket Pool Token (RPL) crowdsale contract
/// @author David Rugendyke

 // Tokens allocated proportionately to each sender according to amount of ETH contributed as a fraction of the total amount of ETH contributed by all senders.
 // credit for original idea and base contract goes to hiddentao - https://github.com/hiddentao/ethereum-token-sales


contract RocketPoolCrowdsale is RocketPoolToken {


    /**** Properties ***********/

    // Crowdsale Params
    bool public isFinalised;                    // True when ICO finalized and successful
    uint256 public targetEth;                   // Target ETH to raise
    uint256 public maxEthAllocation;            // Max ETH allowed per account
    uint256 public fundingStartBlock;           // When to start allowing funding
    uint256 public fundingEndBlock;             // When to stop allowing funding
 
    // Contributions
    mapping (address => uint256) contributions;         // ETH contributed per address
    uint256 public contributedTotal;                    // Total ETH contributed TODO: Make private before deploying


    /*** Events ****************/

    event Contribute(address _sender, uint256 _value);
    event FinaliseSale(address _sender, uint256 _value);
    event RefundContribution(address _sender, uint256 _value);
    event ClaimTokens(address _sender, uint256 _value); 

    
    /**** Methods ***********/

    // Constructor
    /// @dev RPL Crowdsale Init
    /// @param _depositAddress The address that will receive the funds when the crowdsale is finalised
    /// @param _targetEth The target ether amount required for the crowdsale
    /// @param _maxEthAllocation The max ether allowed per account
    /// @param _fundingStartBlock The start block for the crowdsale
    /// @param _fundingEndBlock The end block for the crowdsale
    function RocketPoolCrowdsale(address _depositAddress, uint256 _targetEth, uint256 _maxEthAllocation, uint256 _fundingStartBlock, uint256 _fundingEndBlock) {
        // Initialise params
        isFinalised = false;
        targetEth = _targetEth;                        
        maxEthAllocation = _maxEthAllocation;   
        // Public crowdsale start & end blocks
        fundingStartBlock = _fundingStartBlock;
        fundingEndBlock = _fundingEndBlock;
        // Set the address to receive the funds for the crowdsale and presale
        depositAddress = _depositAddress;
    }

    
    /// @dev Accepts ETH from a contributor
    function() payable external { 
        
        FlagUint(totalSupply);
        FlagUint(exponent);
        FlagUint(1);
        FlagUint(targetEth);
        FlagUint(maxEthAllocation);
        FlagAddress(depositAddress);
        FlagUint(fundingStartBlock);
        FlagUint(fundingEndBlock);
        FlagUint(1);
        FlagUint(block.number);
        FlagUint(msg.value);
        

        // Did they send anything?
        assert(msg.value > 0);  
        // Check if we're ok to receive contributions, have we started?
        assert(block.number > fundingStartBlock);       
        // Already ended?
        assert(block.number < fundingEndBlock);        
        // Max sure the user has not exceeded their ether allocation
        assert((contributions[msg.sender] + msg.value) <= maxEthAllocation);              
        // Add to contributions
        contributions[msg.sender] += msg.value;
        contributedTotal += msg.value;
        // Fire event
        Contribute(msg.sender, msg.value); 
       
    }

    /// @dev Get the contribution total of ETH from a contributor
    /// @param _owner The owners address
    function contributionOf(address _owner) constant returns (uint256 balance) {
        return contributions[_owner];
    }

    /// @dev Finalises the funding and sends the ETH to deposit address
    function finaliseFunding() external {
        // Finalise the crowdsale funds
        assert(!isFinalised);                       
        // Wrong sender?
        assert(msg.sender == depositAddress);            
        // Not yet finished?
        assert(block.number > fundingEndBlock);         
        // Not enough raised?
        assert(contributedTotal >= targetEth);                 
        // We're done now
        isFinalised = true;
        // Send to deposit address - revert all state changes if it doesn't make it
        if (!depositAddress.send(targetEth)) throw;
        // Fire event
        FinaliseSale(msg.sender, targetEth);
    }

    /// @dev Allows contributors to claim their tokens and/or a refund. If funding failed then they get back all their Ether, otherwise they get back any excess Ether
    function claimTokensAndRefund() external {
        // Must have previously contributed
        assert(contributions[msg.sender] > 0); 
        // Crowdfund completed
        assert(block.number > fundingEndBlock);   
        // The users contribution
        uint256 userContributionTotal = contributions[msg.sender];
        // Deduct the contribution now to protect against recursive calls
        contributions[msg.sender] = 0; 
        // Has the contributed total not been reached, but the crowdsale is over?
        if (contributedTotal < targetEth) {
            // Target wasn't met, refund the user
            if (!msg.sender.send(userContributionTotal)) throw;
            // Fire event
            RefundContribution(msg.sender, userContributionTotal);
        } else {
            // Calculate what percent of the ether raised came from me
            uint256 percEtherContributed = Arithmetic.overflowResistantFraction(userContributionTotal, exponent, contributedTotal);
            // Calculate how many tokens I get
            balances[msg.sender] = Arithmetic.overflowResistantFraction(percEtherContributed, totalSupply, exponent);
            FlagUint(percEtherContributed);
            FlagUint(balances[msg.sender]);
            FlagUint(Arithmetic.overflowResistantFraction(percEtherContributed, (contributedTotal - targetEth), exponent));
            // Calculate the refund this user will receive
            if (!msg.sender.send(Arithmetic.overflowResistantFraction(percEtherContributed, (contributedTotal - targetEth), exponent))) throw;
            // Fire event
            ClaimTokens(msg.sender, balances[msg.sender]);
        }
    }
}
