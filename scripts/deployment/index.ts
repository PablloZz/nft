import hre, { network } from "hardhat";
import { deployBasicNft } from "./deployBasicNft";
import { deployRandomIpfsNft } from "./deployRandomIpfsNft";
import { deployDynamicSvgNft } from "./deployDynamicSvgNft";

async function main() {
  const { name } = network;
  const { chainId } = network.config;

  if (!chainId) return console.log("Chain id isn't detected!");

  await hre.run("compile");
  await deployBasicNft();
  await deployRandomIpfsNft(name, chainId);
  await deployDynamicSvgNft(name, chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
