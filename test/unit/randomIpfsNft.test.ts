import { ethers, ignition, network } from "hardhat";
import { developmentChains, networkConfig, VRF_SUB_FUND_AMOUNT } from "../../helper-hardhat-config";
import { type Contract, type EventLog } from "ethers";
import { type RandomIpfsNft, type VRFCoordinatorV2_5Mock } from "typechain-types";
import VRFCoordinatorV2_5MockModule from "../../ignition/modules/VRFCoordinatorV2_5Mock";
import RandomIpfsNftModule from "../../ignition/modules/RandomIpfsNft";
import { assert, expect } from "chai";

let tokenUris = [
  "ipfs://QmamTejxszRGM2Ee423fUf3KVVBeoozGC7ggkFREAXw7SD",
  "ipfs://QmVghx6uii8TEcDiBy7ezNgLthjgguBzsD1nynxj3SyjEL",
  "ipfs://QmWMuP2QpZpbnfaZQxMfWL1raZDrS4HtnjqEGmvGHkFWLA",
];

developmentChains.includes(network.name)
  ? describe("RandomIpfsNft", () => {
      const { mintFee } = networkConfig[network.config.chainId!];
      let vrfCoordinatorV2_5Mock: Contract & VRFCoordinatorV2_5Mock;
      let randomIpfsNft: Contract & RandomIpfsNft;
      let deployerAddress: string;

      beforeEach(async () => {
        deployerAddress = (await ethers.getSigners())[0].address;
        vrfCoordinatorV2_5Mock = (await ignition.deploy(VRFCoordinatorV2_5MockModule))
          .vrfCoordinatorV2_5Mock as Contract & VRFCoordinatorV2_5Mock;

        const vrfCoordinatorV2_5Address = await vrfCoordinatorV2_5Mock.getAddress();
        const transactionResponse = await vrfCoordinatorV2_5Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        const subscriptionId = (transactionReceipt!.logs[0] as EventLog).args[0];
        await vrfCoordinatorV2_5Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);

        randomIpfsNft = (
          await ignition.deploy(RandomIpfsNftModule, {
            parameters: {
              RandomIpfsNftModule: {
                subscriptionId,
                vrfCoordinatorV2_5Address,
                tokenUris,
              },
            },
          })
        ).randomIpfsNft as Contract & RandomIpfsNft;

        const randomIpfsNftAddress = await randomIpfsNft.getAddress();
        await vrfCoordinatorV2_5Mock.addConsumer(subscriptionId, randomIpfsNftAddress);
      });

      describe("constructor", () => {
        it("Initializes constructor correctly", async () => {
          const dogTokenUri = await randomIpfsNft.getDogTokenUris(0);
          const contractMintFee = await randomIpfsNft.getMintFee();

          assert.equal(mintFee, String(contractMintFee));
          assert.isTrue(dogTokenUri.startsWith("ipfs://"));
        });
      });

      describe("requestNft", () => {
        it("Reverts if not enough ETH was sent", async () => {
          await expect(
            randomIpfsNft.requestNft({
              value: ethers.parseEther("0.0001"),
            }),
          ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__NeedMoreETHSent");
        });
        it("Emits a NftRequested event", async () => {
          expect(randomIpfsNft.requestNft({ value: mintFee })).to.be.emit(
            randomIpfsNft,
            "NftRequested",
          );
        });
        it("Emits an event with requestId and nft requester address", async () => {
          const transactionResponse = await randomIpfsNft.requestNft({
            value: mintFee,
          });

          const transactionReceipt = await transactionResponse.wait(1);
          const [requestId, requester] = (transactionReceipt!.logs[1] as EventLog).args;
          assert.equal(typeof requestId, "bigint");
          assert.equal(requester, deployerAddress);
        });
        it("Stores requester address by request", async () => {
          const transactionResponse = await randomIpfsNft.requestNft({
            value: mintFee,
          });

          const transactionReceipt = await transactionResponse.wait(1);
          const [requestId] = (transactionReceipt!.logs[1] as EventLog).args;
          
        });
      });
    })
  : describe.skip;
