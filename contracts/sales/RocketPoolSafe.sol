pragma solidity ^0.4.10;
import './base/StandardToken.sol';

/// @title Sets the main Rocket Pool Token address and pre-sale account addresses + unlock date
 // Note: Undecided on token pre-sale, but adding this in now
/// @author David Rugendyke

contract RocketPoolSafe {

  mapping (address => uint256) allocations;
  uint256 public unlockDate;
  address public RocketPoolToken;
  uint256 public constant exponent = 10**18;

  /// @dev Constructor - Sets the main Rocket Pool Token address and pre-sale account addresses + unlock date
  /// @param _RocketPoolToken Address of the main Rocket Pool Token contract
  function RocketPoolSafe(address _RocketPoolToken) {
    // Set the main token address
    RocketPoolToken = _RocketPoolToken;
    // Set the unlock date for the token pre-sale
    unlockDate = now + 1 * 30 days;
    // Set the address pre-allocations
    //allocations[0xe0faEF3D61255d1Bd7ad66987D2fBB3AE5Ee8E33] = 16000000;
  }

  function unlock() external {
    // Check the current date is passed the unlock date for presale
    assert(now < unlockDate);
    // Get the amount the user is entitled, will get 0 if the address is not in the allocations
    uint256 entitled = allocations[msg.sender];
    // Set their amount to 0 now
    allocations[msg.sender] = 0;
    // Check the token contract is legit and sends ok, throw if not
    if(!StandardToken(RocketPoolToken).transfer(msg.sender, entitled * exponent)) throw;
  }

}
