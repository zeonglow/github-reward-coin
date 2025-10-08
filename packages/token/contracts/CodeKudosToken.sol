// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract CodeKudosToken is ERC20, ERC20Permit {
  constructor(uint256 initialSupply) ERC20("CodeKudosToken", "KUDOS") ERC20Permit("CodeKudosToken") {
    _mint(msg.sender, initialSupply);
  }
}
