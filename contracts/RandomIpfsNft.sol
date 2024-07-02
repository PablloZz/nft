// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { VRFConsumerBaseV2Plus } from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { VRFV2PlusClient } from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract RandomIpfsNft is VRFConsumerBaseV2Plus {
  // When we mint an NFT, we will trigger a Chainlink VRF call to get us a random number
  // Using that number, we will get a random NFT
  // Pug, Shiba Inu, St. Bernard
  // Pug is super rare
  // Shiba is sort of rare
  // St. Bernard is common

  // Users have to pay to mint an NFT
  // The owner of the contract can withdraw the ETH

  constructor(
    uint256 s_subscriptionId,
    address vrfCoordinator,
    bytes32 s_keyHash,
    uint32 callbackGasLimit,
    uint16 requestConfirmations,
    uint32 numWords
  ) VRFConsumerBaseV2Plus(vrfCoordinator) {}

  function requestNft() public {}

  function fulfillRandomWords(
    uint256 requestId,
    uint256[] calldata randomWords
  ) internal override {}

  function tokenURI(uint256 /* tokenId */) public {}
}
