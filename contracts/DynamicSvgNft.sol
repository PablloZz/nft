// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
  // Mint
  // Store our SVG information somewhere
  // Some logic to say "Show X Image" or "Show Y Image"
  uint256 private s_tokenCounter;
  string private immutable i_frounyImageURI;
  string private immutable i_fancyImageURI;
  string private constant BASE64_ENCODED_SVG_PREFIX = "data:image/svg+xml;base64,";

  constructor() ERC721("Dynamic SVG NFT", "DSN") {
    s_tokenCounter = 0;
  }

  function svgToImageURI(string memory svg) public pure returns (string memory) {}

  function mintNft() public {
    _safeMint(msg.sender, s_tokenCounter);
    s_tokenCounter += 1;
  }
}
