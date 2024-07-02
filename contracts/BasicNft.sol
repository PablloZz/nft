// SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
  public uint256 s_tokenCounter;
  constructor() ERC721("Dogie", "DOG") {
    s_tokenCounter = 0;
  }

  function mintNft() public returns (uint256) {
    _safeMint(msg.sender, s_tokenCounter);
    s_tokenCounter = s_tokenCounter + 1;

    return s_tokenCounter;
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}
