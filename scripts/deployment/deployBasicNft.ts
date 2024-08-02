import { ignition } from "hardhat";
import { vars } from "hardhat/config";
import { developmentChains } from "../../helper-hardhat-config";
import BasicNftModule from "../../ignition/modules/BasicNft";
import { verify } from "../../utils/verify";
import { type BasicNft } from "typechain-types";
import { type Contract } from "ethers";

async function deployBasicNft(networkName: string) {
  const basicNft = (await ignition.deploy(BasicNftModule)).basicNft as Contract & BasicNft;
  const basicNftAddress = await basicNft.getAddress();

  if (!developmentChains.includes(networkName) && vars.get("ETHERSCAN_API_KEY")) {
    await verify(basicNftAddress, []);
  }

  return basicNft;
}

export { deployBasicNft };
