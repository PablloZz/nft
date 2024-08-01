import { ethers, ignition, network } from "hardhat";
import DynamicSvgNftModule from "../../ignition/modules/DynamicSvgNft";
import MockV3AggregatorModule from "../../ignition/modules/MockV3Aggregator";
import { type DynamicSvgNft, type MockV3Aggregator } from "../../typechain-types";
import { type Contract } from "ethers";
import { assert } from "chai";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name)
  ? describe("RandomIpfsNft", () => {
      let dynamicSvgNft: Contract & DynamicSvgNft;
      let mockV3Aggregator: Contract & MockV3Aggregator;
      let mockV3AggregatorAddress = "";
      let dynamicSvgNftAddress = "";
      let deployerAddress: string;

      beforeEach(async () => {
        deployerAddress = (await ethers.getSigners())[0].address;
        mockV3Aggregator = (await ignition.deploy(MockV3AggregatorModule))
          .mockV3Aggregator as Contract & MockV3Aggregator;

        mockV3AggregatorAddress = await mockV3Aggregator.getAddress();
      });
    })
  : describe.skip;
