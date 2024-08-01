import { ethers, ignition, network } from "hardhat";
import DynamicSvgNftModule from "../../ignition/modules/DynamicSvgNft";
import MockV3AggregatorModule from "../../ignition/modules/MockV3Aggregator";
import { type DynamicSvgNft, type MockV3Aggregator } from "../../typechain-types";
import { type Contract } from "ethers";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
import path from "node:path";
import fs from "node:fs";

const FROWN_SVG = fs.readFileSync(path.resolve(__dirname, "../../images/dynamicSvgNft/frown.svg"), {
  encoding: "utf8",
});

const HAPPY_SVG = fs.readFileSync(path.resolve(__dirname, "../../images/dynamicSvgNft/happy.svg"), {
  encoding: "utf8",
});

const HIGH_VALUE = ethers.parseUnits("3000", "ether");

developmentChains.includes(network.name)
  ? describe("DynamicSvgNft", () => {
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
        dynamicSvgNft = (
          await ignition.deploy(DynamicSvgNftModule, {
            parameters: {
              DynamicSvgNftModule: {
                priceFeedAddress: mockV3AggregatorAddress,
                frownSvg: FROWN_SVG,
                happySvg: HAPPY_SVG,
              },
            },
          })
        ).dynamicSvgNft as Contract & DynamicSvgNft;

        dynamicSvgNftAddress = await dynamicSvgNft.getAddress();
      });

      describe("constructor", () => {
        it("Initializes the constructor correctly", async () => {
          const tokenCounter = await dynamicSvgNft.getTokenCounter();
          const priceFeed = await dynamicSvgNft.getPriceFeed();
          const frownSvg = await dynamicSvgNft.getFrownSvg();
          const fancySvg = await dynamicSvgNft.getFancySvg();
          const base64FrownSvg = await dynamicSvgNft.svgToImageURI(FROWN_SVG);
          const base64FancySvg = await dynamicSvgNft.svgToImageURI(HAPPY_SVG);

          assert.equal(priceFeed, mockV3AggregatorAddress);
          assert.equal(frownSvg, base64FrownSvg);
          assert.equal(fancySvg, base64FancySvg);
          assert.equal(String(tokenCounter), "0");
        });
      });

      describe("mintNft", () => {
        it("Updates token counter", async () => {
          const tokenCounter = Number(await dynamicSvgNft.getTokenCounter());
          await dynamicSvgNft.mintNft(HIGH_VALUE);
          const updatedTokenCounter = Number(await dynamicSvgNft.getTokenCounter());
          const expectedTokenCounter = tokenCounter + 1;

          assert.equal(updatedTokenCounter, expectedTokenCounter);
        });
        it("Sets a token high value", async () => {
          const tokenCounter = await dynamicSvgNft.getTokenCounter();
          await dynamicSvgNft.mintNft(HIGH_VALUE);
          const tokenHighValue = await dynamicSvgNft.getTokenHighValue(tokenCounter);

          assert.equal(tokenHighValue, HIGH_VALUE);
        });
        it("Emits an event with a token counter and high value", async () => {
          const tokenCounter = await dynamicSvgNft.getTokenCounter();

          await expect(dynamicSvgNft.mintNft(HIGH_VALUE))
            .to.be.emit(dynamicSvgNft, "NFTCreated")
            .withArgs(tokenCounter, HIGH_VALUE);
        });
      });

      describe("tokenURI", () => {
        it("Reverts when getting a non existed token", async () => {
          const nonExistedTokenCounter = 10000;

          await expect(
            dynamicSvgNft.tokenURI(nonExistedTokenCounter),
          ).to.be.revertedWithCustomError(dynamicSvgNft, "DynamicSvgNft__UriForNonExistedToken");
        });
        it("Returns frownImageURI when the price is lower than the token high value", async () => {
          const tokenCounter = await dynamicSvgNft.getTokenCounter();
          await dynamicSvgNft.mintNft(HIGH_VALUE);
          const tokenURI = await dynamicSvgNft.tokenURI(tokenCounter);
          const base64FrownSvg = await dynamicSvgNft.svgToImageURI(FROWN_SVG);

          const decodedTokenURI = JSON.parse(
            String(Buffer.from(tokenURI.split("data:application/json;base64")[1], "base64")),
          );

          assert.equal(decodedTokenURI.image, base64FrownSvg);
        });
        it("Returns fancyImageURI when the price is higher than the token high value", async () => {
          const tokenCounter = await dynamicSvgNft.getTokenCounter();
          await dynamicSvgNft.mintNft(HIGH_VALUE);
          const higherValue = ethers.parseUnits("5000", "ether");
          await mockV3Aggregator.updateAnswer(higherValue);
          const tokenURI = await dynamicSvgNft.tokenURI(tokenCounter);
          const base64FancySvg = await dynamicSvgNft.svgToImageURI(HAPPY_SVG);

          const decodedTokenURI = JSON.parse(
            String(Buffer.from(tokenURI.split("data:application/json;base64")[1], "base64")),
          );

          assert.equal(decodedTokenURI.image, base64FancySvg);
        });
      });
    })
  : describe.skip;
