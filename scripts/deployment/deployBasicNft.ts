import { ignition, network } from "hardhat";
import { vars } from "hardhat/config";
import { developmentChains } from "../../helper-hardhat-config";
import BasicNftModule from "../../ignition/modules/BasicNft";
import { verify } from "../../utils/verify";

async function deployBasicNft() {
  const basicNft = (await ignition.deploy(BasicNftModule)).basicNft;
  const basicNftAddress = await basicNft.getAddress();

  if (!developmentChains.includes(network.name) && vars.get("ETHERSCAN_API_KEY")) {
    await verify(basicNftAddress, []);
  }
}

export { deployBasicNft };
