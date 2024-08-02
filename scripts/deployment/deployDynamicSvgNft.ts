import { ignition } from "hardhat";
import { vars } from "hardhat/config";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import DynamicSvgNftModule from "../../ignition/modules/DynamicSvgNft";
import MockV3AggregatorModule from "../../ignition/modules/MockV3Aggregator";
import { verify } from "../../utils";
import { type Contract } from "ethers";
import { type DynamicSvgNft, type MockV3Aggregator } from "typechain-types";
import fs from "node:fs";
import path from "node:path";

async function deployDynamicSvgNft(networkName: string, chainId: number) {
  let mockV3Aggregator: Contract & MockV3Aggregator;
  let mockV3AggregatorAddress = "";

  if (developmentChains.includes(networkName)) {
    mockV3Aggregator = (await ignition.deploy(MockV3AggregatorModule))
      .mockV3Aggregator as Contract & MockV3Aggregator;

    mockV3AggregatorAddress = await mockV3Aggregator.getAddress();
  } else {
    mockV3AggregatorAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const frownSvg = fs.readFileSync(
    path.resolve(__dirname, "../../images/dynamicSvgNft/frown.svg"),
    {
      encoding: "utf8",
    },
  );

  const happySvg = fs.readFileSync(
    path.resolve(__dirname, "../../images/dynamicSvgNft/happy.svg"),
    {
      encoding: "utf8",
    },
  );

  const dynamicSvgNft = (
    await ignition.deploy(DynamicSvgNftModule, {
      parameters: {
        DynamicSvgNftModule: {
          priceFeedAddress: mockV3AggregatorAddress,
          frownSvg,
          happySvg,
        },
      },
    })
  ).dynamicSvgNft as Contract & DynamicSvgNft;

  const dynamicSvgNftAddress = await dynamicSvgNft.getAddress();

  if (!developmentChains.includes(networkName) && vars.get("ETHERSCAN_API_KEY")) {
    await verify(dynamicSvgNftAddress, [mockV3AggregatorAddress, frownSvg, happySvg]);
  }

  console.log("------------------------------------");

  return dynamicSvgNft;
}

export { deployDynamicSvgNft };
