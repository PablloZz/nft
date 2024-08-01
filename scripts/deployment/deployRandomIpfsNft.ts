import { ignition } from "hardhat";
import { vars } from "hardhat/config";
import { VRF_SUB_FUND_AMOUNT, developmentChains, networkConfig } from "../../helper-hardhat-config";
import RandomIpfsNftModule from "../../ignition/modules/RandomIpfsNft";
import VRFCoordinatorV2_5MockModule from "../../ignition/modules/VRFCoordinatorV2_5Mock";
import {
  verify,
  uploadTokenImages,
  uploadTokenUriMetadata,
  type TokenUriMetadata,
} from "../../utils";
import { type Contract, type EventLog } from "ethers";
import { type VRFCoordinatorV2_5Mock } from "typechain-types";

const IMAGES_DIR_PATH = "./images/randomIpfsNft";

let tokenUris = [
  "ipfs://QmamTejxszRGM2Ee423fUf3KVVBeoozGC7ggkFREAXw7SD",
  "ipfs://QmVghx6uii8TEcDiBy7ezNgLthjgguBzsD1nynxj3SyjEL",
  "ipfs://QmWMuP2QpZpbnfaZQxMfWL1raZDrS4HtnjqEGmvGHkFWLA",
];

async function deployRandomIpfsNft(networkName: string, chainId: number) {
  let vrfCoordinatorV2_5Mock: Contract & VRFCoordinatorV2_5Mock;
  let vrfCoordinatorV2_5Address: string;
  let subscriptionId = "";

  if (vars.get("UPLOAD_TO_PINATA") === "true") tokenUris = await handleTokenUris();
  // Get the IPFS hashes of our images
  // 1. With our own IPFS node
  // 2. Pinata
  // 3. NFT.storage

  if (developmentChains.includes(networkName)) {
    vrfCoordinatorV2_5Mock = (await ignition.deploy(VRFCoordinatorV2_5MockModule))
      .vrfCoordinatorV2_5Mock as Contract & VRFCoordinatorV2_5Mock;

    vrfCoordinatorV2_5Address = await vrfCoordinatorV2_5Mock.getAddress();
    const transactionResponse = await vrfCoordinatorV2_5Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = (transactionReceipt!.logs[0] as EventLog).args[0];
    await vrfCoordinatorV2_5Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
  } else {
    vrfCoordinatorV2_5Address = networkConfig[chainId].vrfCoordinatorV2Plus;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  const randomIpfsNft = (
    await ignition.deploy(RandomIpfsNftModule, {
      parameters: {
        RandomIpfsNftModule: {
          subscriptionId,
          vrfCoordinatorV2_5Address,
          tokenUris,
        },
      },
    })
  ).randomIpfsNft;

  const randomIpfsNftAddress = await randomIpfsNft.getAddress();

  if (developmentChains.includes(networkName)) {
    await vrfCoordinatorV2_5Mock!.addConsumer(subscriptionId, randomIpfsNftAddress);
  }

  if (!developmentChains.includes(networkName) && vars.get("ETHERSCAN_API_KEY")) {
    await verify(randomIpfsNftAddress, [subscriptionId, vrfCoordinatorV2_5Address, tokenUris]);
  }

  console.log("------------------------------------");
}

async function handleTokenUris() {
  const tokenUris: string[] = [];
  // Store the image in IPFS
  // Store the metadata in IPFS
  const { files, responses: imageUploadResponses } = await uploadTokenImages(IMAGES_DIR_PATH);

  for (let i = 0; i < imageUploadResponses.length; i++) {
    const tokenUriMetadataName = files[i].replace(".png", "");
    const tokenUriMetadataDescription = `An adorable ${tokenUriMetadataName} pup!`;
    const tokenUriMetadataImage = `ipfs://${imageUploadResponses[i].IpfsHash}`;

    const tokenUriMetadata: TokenUriMetadata = {
      name: tokenUriMetadataName,
      description: tokenUriMetadataDescription,
      image: tokenUriMetadataImage,
      attributes: {
        traitType: "Cuteness",
        value: 100,
      },
    };

    console.log(`Uploading ${tokenUriMetadataName}...`);
    const metadataUploadResponse = await uploadTokenUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse?.IpfsHash}`);
  }

  console.log("Token Uris Uploaded! They are:");
  console.log(tokenUris);

  return tokenUris;
}

export { deployRandomIpfsNft };
