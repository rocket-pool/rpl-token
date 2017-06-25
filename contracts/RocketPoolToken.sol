pragma solidity ^0.4.10;
import "./base/StandardToken.sol";
import "./base/SafeMath.sol";

/// @title The main Rocket Pool Token (RPL) crowdsale contract
/// @author David Rugendyke

 // Tokens allocated proportionately to each sender according to amount of ETH contributed as a fraction of the total amount of ETH contributed by all senders.
 // credit for original idea and base contract goes to hiddentao - https://github.com/hiddentao/ethereum-token-sales


contract RocketPoolToken is StandardToken, SafeMath {


    /**** Properties ***********/

    string public name = 'RocketPoolToken';
    string public symbol = 'RPL';
    uint256 public constant decimals = 18;
    string public version = "1.0";
    uint256 public totalSupply = 50**6;    // 50 Million

    // Important Addresses
    address public depositAddress;        // Deposit address for ETH for ICO owner

    // Crowdsale Params
    bool public isFinalized;              // True when ICO finalized and successful
    uint256 public targetEth;             // Target ETH to raise
    uint256 public maxEthPerTx;           // Max ETH allowed per contribution
    uint256 public fundingStartBlock;     // When to start allowing funding
    uint256 public fundingEndBlock;       // When to stop allowing funding
    uint256 public txGasLimit;            // The max allowed gas for a contribution

    // Calculated values
    mapping (address => uint256) contributions;     // ETH contributed per address
    uint256 contributed;                            // Total ETH contributed


    /*** Events ****************/

    event CreateFairToken(string _name);
    event Contribute(address _sender, uint256 _value);
    event FinalizeSale(address _sender);
    event RefundContribution(address _sender, uint256 _value);
    event ClaimTokens(address _sender, uint256 _value);

    
    /**** Methods ***********/

    // Constructor
    /// @dev RPL Token Init
    /// @param _minEth The target ether amount required for the crowdsale
    /// @param _depositAddress The address that will receive the funds when the crowdsale is finalised
    /// @param _fundingStartBlock The start block for the crowdsale
    /// @param _fundingEndBlock The end block for the crowdsale
    function RocketPoolToken(uint256 _minEth, uint256 _maxEthPerTx, address _depositAddress, uint256 _fundingStartBlock, uint256 _fundingEndBlock, uint256 _txGasLimit) {
        // Initialise params
        isFinalized = false;
        targetEth = _minEth;
        maxEthPerTx = _maxEthPerTx;
        depositAddress = _depositAddress;
        fundingStartBlock = _fundingStartBlock;
        fundingEndBlock = _fundingEndBlock;
        txGasLimit = _txGasLimit;
        // Fire event
        CreateFairToken(name);
    }

    /// @dev Accepts ETH from a contributor
    function() payable external {
        // Check if we're ok to receive contributions, have we started?
        assert(block.number > fundingStartBlock);       
        // Already ended?
        assert(block.number < fundingEndBlock);       
        // There is actual eth attached to msg and its within the limit per tx
        assert(msg.value > 0 && msg.value <= maxEthPerTx);   
        // It's within the tx gas range
        assert(tx.gasprice <= txGasLimit);                       
        // Add to contributions
        contributions[msg.sender] += msg.value;
        contributed += msg.value;
        // Fire event
        Contribute(msg.sender, msg.value); 
    }

    /// Finalizes the funding and sends the ETH to deposit address
    function finaliseFunding() external {
        // Finalise the crowdsale funds
        assert(isFinalized) ;                       
        // Wrong sender?
        assert(msg.sender == depositAddress);            
        // Not yet finished?
        assert(block.number > fundingEndBlock);         
        // Not enough raised?
        assert(contributed >= targetEth);                 
        // We're done now
        isFinalized = true;
        // Send to deposit address - revert all state changes if it doesn't make it
        if (!depositAddress.send(targetEth)) throw;
        // Fire event
        FinalizeSale(msg.sender);
    }

    /// Allows contributors to claim their tokens and/or a refund. If funding failed then they get back all their Ether, otherwise they get back any excess Ether
    function claimTokensAndRefund() external {
        if (0 == contributions[msg.sender]) throw;    // must have previously contributed
        if (block.number < fundingEndBlock) throw;    // not yet done?

        // if not enough funding
        if (contributed < targetEth) {
            // refund my full contribution
            if (!msg.sender.send(contributions[msg.sender])) throw;
            RefundContribution(msg.sender, contributions[msg.sender]);
        } else {
            // calculate how many tokens I get
            balances[msg.sender] = safeMult(totalSupply, contributions[msg.sender]) / contributed;
            // refund excess ETH
            if (!msg.sender.send(contributions[msg.sender] - (safeMult(targetEth, contributions[msg.sender]) / contributed))) throw;
            ClaimTokens(msg.sender, balances[msg.sender]);
      }

      contributions[msg.sender] = 0;
    }
}
