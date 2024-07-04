import { ignition, network } from "hardhat";
import { vars } from "hardhat/config";
import { VRF_SUB_FUND_AMOUNT, developmentChains } from "../../helper-hardhat-config";
import RandomIpfsNftModule from "../../ignition/modules/RandomIpfsNft";
import VRFCoordinatorV2_5MockModule from "../../ignition/modules/VRFCoordinatorV2_5Mock";
import { verify } from "../../utils/verify";
import type { Contract, EventLog } from "ethers";
import type { VRFCoordinatorV2_5Mock } from "typechain-types";

async function deployRandomIpfsNft() {
  let vrfCoordinatorV2_5Mock: Contract & VRFCoordinatorV2_5Mock;
  let vrfCoordinatorV2_5Address: string;
  let subscriptionId = "";
  let tokenUris: string[];

  if (vars.get("UPLOAD_TO_PINATA") === "true") {
    tokenUris = await handleTokenUris();
  }
  // Get the IPFS hashes of our images
  // 1. With our own IPFS node
  // 2. Pinata
  // 3. NFT.storage

  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2_5Mock = (await ignition.deploy(VRFCoordinatorV2_5MockModule))
      .VRFCoordinatorV2_5MockModule as Contract & VRFCoordinatorV2_5Mock;
    vrfCoordinatorV2_5Address = await vrfCoordinatorV2_5Mock.getAddress();
    const transactionResponse = await vrfCoordinatorV2_5Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = (transactionReceipt!.logs[0] as EventLog).args[0];
    await vrfCoordinatorV2_5Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
  }

  const randomIpfsNft = (await ignition.deploy(RandomIpfsNftModule)).randomIpfsNft;
  const randomIpfsNftAddress = await randomIpfsNft.getAddress();

  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2_5Mock!.addConsumer(subscriptionId, randomIpfsNftAddress);
  }

  if (!developmentChains.includes(network.name) && vars.get("ETHERSCAN_API_KEY")) {
    await verify(randomIpfsNftAddress, []);
  }

  console.log("------------------------------------");
}

export { deployRandomIpfsNft };
