// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// import "base64-sol/base64.sol";

error DynamicSvgNft__UriForNonExistedToken();

contract DynamicSvgNft is ERC721 {
  // Mint
  // Store our SVG information somewhere
  // Some logic to say "Show X Image" or "Show Y Image"
  uint256 private s_tokenCounter;
  string private s_frownImageURI;
  string private s_fancyImageURI;
  string private constant BASE64_ENCODED_SVG_PREFIX = "data:image/svg+xml;base64,";
  AggregatorV3Interface internal immutable i_priceFeed;
  mapping(uint256 => int256) public s_tokenIdToHighValue;

  event NFTCreated(uint256 indexed tokenId, int256 indexed highValue);

  constructor(
    address priceFeedAddress,
    string memory lowSvg,
    string memory highSvg
  ) ERC721("Dynamic SVG NFT", "DSN") {
    s_tokenCounter = 0;
    s_frownImageURI = svgToImageURI(lowSvg);
    s_fancyImageURI = svgToImageURI(highSvg);
    i_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  function svgToImageURI(string memory svg) public pure returns (string memory) {
    string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
    return string(abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded));
  }

  function mintNft(int256 highValue) public {
    uint256 newTokenId = s_tokenCounter;
    s_tokenCounter += 1;
    s_tokenIdToHighValue[newTokenId] = highValue;
    _safeMint(msg.sender, newTokenId);
    emit NFTCreated(newTokenId, highValue);
  }

  function _baseURI() internal pure override returns (string memory) {
    return "data:application/json;base64";
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    if (!_exists(tokenId)) {
      revert DynamicSvgNft__UriForNonExistedToken();
    }
    // data:image/svg+xml;base64
    // data:application/json;base64

    (, int256 price, , , ) = i_priceFeed.latestRoundData();
    string memory imageURI = s_frownImageURI;

    if (price >= s_tokenIdToHighValue[tokenId]) {
      imageURI = s_fancyImageURI;
    }

    return
      string(
        abi.encodePacked(
          _baseURI(),
          Base64.encode(
            abi.encodePacked(
              '{"name":"',
              name(),
              '", "description":"An NFT that changes based on the Chainlink Feed", ',
              '"attributes": [{"trait_type": "coolness", "value": 100}], "image": "',
              imageURI,
              '"}'
            )
          )
        )
      );
  }

  function getFrownSvg() public view returns (string memory) {
    return s_frownImageURI;
  }

  function getFancySvg() public view returns (string memory) {
    return s_fancyImageURI;
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return i_priceFeed;
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }

  function getTokenHighValue(uint256 tokenId) public view returns (int256) {
    return s_tokenIdToHighValue[tokenId];
  }
}
