import hre, { network } from "hardhat";
import { deployBasicNft } from "./deployBasicNft";
import { deployRandomIpfsNft } from "./deployRandomIpfsNft";
import { deployDynamicSvgNft } from "./deployDynamicSvgNft";
import { developmentChains } from "../../helper-hardhat-config";
import { ethers, type EventLog } from "ethers";

async function main() {
  const { name } = network;
  const { chainId } = network.config;

  if (!chainId) return console.log("Chain id isn't detected!");

  await hre.run("compile");
  const basicNft = await deployBasicNft(name);
  const { randomIpfsNft, vrfCoordinatorV2_5Mock } = await deployRandomIpfsNft(name, chainId);
  const dynamicSvgNft = await deployDynamicSvgNft(name, chainId);

  // // Basic NFT
  const basicNftMintTx = await basicNft.mintNft();
  await basicNftMintTx.wait(1);
  console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`);
  //https://sepolia.etherscan.io/address/0xb7b93044a12Fb4905640C8D36da586816f9E1f51#code

  // Random Ipfs NFT
  const mintFee = await randomIpfsNft.getMintFee();
  await new Promise<void>(async (resolve, reject) => {
    setTimeout(resolve, 400000);

    randomIpfsNft.once("NftMinted", async () => {
      resolve();
    });

    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: String(mintFee) });
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);

    if (developmentChains.includes(network.name)) {
      const [requestId] = (randomIpfsNftMintTxReceipt?.logs[1] as EventLog).args;
      const randomIpfsNftAddress = await randomIpfsNft.getAddress();
      await vrfCoordinatorV2_5Mock!.fulfillRandomWords(requestId, randomIpfsNftAddress);
    }
  });

  console.log(`Random Ipfs NFT index 0 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`);
  // https://sepolia.etherscan.io/address/0x54dcaEfaD9558040A8eb895B03B620305904eb8F#code
  
  // Dynamic Svg NFT
  const highValue = ethers.parseEther("3500");
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue);
  await dynamicSvgNftMintTx.wait(1);
  console.log(`Dynamic Svg NFT index 0 has tokenURI: ${await dynamicSvgNft.tokenURI(0)}`);
  // https://sepolia.etherscan.io/address/0x85Da80684c1E8A3DEb99D4207cC2302a9657B07F#code
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
