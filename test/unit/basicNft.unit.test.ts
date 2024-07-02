import { ethers, ignition, network } from "hardhat";
import BasicNftModule from "../../ignition/modules/BasicNft";
import { type BasicNft } from "../../typechain-types";
import { type Contract } from "ethers";
import { assert } from "chai";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name)
  ? describe("BasicNft Unit Tests", () => {
      let basicNft: BasicNft & Contract;
      let deployerAddress: string;

      beforeEach(async () => {
        basicNft = (await ignition.deploy(BasicNftModule)).basicNft as Contract & BasicNft;
        deployerAddress = (await ethers.getSigners())[0].address;
      });

      describe("constructor", () => {
        it("Initializes constructor correctly", async () => {
          const name = await basicNft.name();
          const symbol = await basicNft.symbol();
          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(name, "Dogie");
          assert.equal(symbol, "DOG");
          assert.equal(String(tokenCounter), "0");
        });
      });

      describe("mintNft", () => {
        beforeEach(async () => {
          const transactionResponse = await basicNft.mintNft();
          await transactionResponse.wait(1);
        });
        it("Allows user to mint an NFT, and updates appropriately", async () => {
          const tokenURI = await basicNft.tokenURI(0);
          const tokenCounter = await basicNft.getTokenCounter();

          assert.equal(String(tokenCounter), "1");
          assert.equal(tokenURI, await basicNft.TOKEN_URI());
        });
        it("Shows the correct balance and owner of an NFT", async () => {
          const deployerBalance = await basicNft.balanceOf(deployerAddress);
          const owner = await basicNft.ownerOf(0);

          assert.equal(String(deployerBalance), "1");
          assert.equal(owner, deployerAddress);
        });
      });
    })
  : describe.skip;
