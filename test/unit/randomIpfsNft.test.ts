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

type DogBreed = 0n | 1n | 2n;

developmentChains.includes(network.name)
  ? describe("RandomIpfsNft", () => {
      const { mintFee } = networkConfig[network.config.chainId!];
      let vrfCoordinatorV2_5Mock: Contract & VRFCoordinatorV2_5Mock;
      let randomIpfsNft: Contract & RandomIpfsNft;
      let deployerAddress: string;
      let randomIpfsNftAddress: string;

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

        randomIpfsNftAddress = await randomIpfsNft.getAddress();
        await vrfCoordinatorV2_5Mock.addConsumer(subscriptionId, randomIpfsNftAddress);
      });

      describe("constructor", () => {
        it("Initializes constructor correctly", async () => {
          const dogTokenUri = await randomIpfsNft.getDogTokenUri(0);
          const contractMintFee = await randomIpfsNft.getMintFee();

          assert.equal(mintFee, String(contractMintFee));
          assert.isTrue(dogTokenUri.startsWith("ipfs://"));
        });
      });

      describe("requestNft", () => {
        it("Reverts if payment isn't sent with the request", async () => {
          await expect(randomIpfsNft.requestNft()).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent",
          );
        });
        it("Reverts if not enough ETH was sent", async () => {
          const fee = await randomIpfsNft.getMintFee();

          await expect(
            randomIpfsNft.requestNft({
              value: fee - ethers.parseEther("0.0001"),
            }),
          ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__NeedMoreETHSent");
        });
        it("Emits an event with requestId and nft requester address", async () => {
          const fee = await randomIpfsNft.getMintFee();
          await expect(randomIpfsNft.requestNft({ value: fee }))
            .to.emit(randomIpfsNft, "NftRequested")
            .withArgs(1n, deployerAddress);
        });
      });

      describe("fulfillRandomWords", () => {
        it("Mints NFT after random number is returned", async () => {
          const initialTokenCounter = await randomIpfsNft.getTokenCounter();

          await new Promise<void>(async (resolve, reject) => {
            randomIpfsNft.once("NftMinted", async (dogBreed: DogBreed, dogOwner: string) => {
              try {
                const updatedTokenCounter = await randomIpfsNft.getTokenCounter();
                const tokenUri = await randomIpfsNft.tokenURI(initialTokenCounter);
                const dogUri = await randomIpfsNft.getDogTokenUri(dogBreed);

                assert.equal(
                  Number(String(updatedTokenCounter)),
                  Number(String(initialTokenCounter)) + 1,
                );

                assert.equal(dogOwner, deployerAddress);
                assert.equal(dogUri, tokenUri);
                assert.isTrue(tokenUri.includes("ipfs://"));
              } catch (error) {
                console.error(error);
                reject();
              }

              resolve();
            });

            try {
              const fee = await randomIpfsNft.getMintFee();
              const transactionResponse = await randomIpfsNft.requestNft({ value: fee });
              const transactionReceipt = await transactionResponse.wait(1);
              const [requestId] = (transactionReceipt!.logs[1] as EventLog).args;
              await vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, randomIpfsNftAddress);
            } catch (error) {
              console.error(error);
              reject(error);
            }
          });
        });
      });
      describe("getBreedFromModdedRng", () => {
        it("Should return pug if moddedRng is less than 10", async () => {
          const breedIndex = await randomIpfsNft.getBreedFromModdedRng(7);
          assert.equal(breedIndex, 0n);
        });
        it("Should return pug if moddedRng is between 10 and 39", async () => {
          const breedIndex = await randomIpfsNft.getBreedFromModdedRng(12);
          assert.equal(breedIndex, 1n);
        });
        it("Should return pug if moddedRng is between 40 and 99", async () => {
          const breedIndex = await randomIpfsNft.getBreedFromModdedRng(53);
          assert.equal(breedIndex, 2n);
        });
        it("Reverts if moddedRng is greater or equal to all chance array sums", async () => {
          const chanceArray = await randomIpfsNft.getChanceArray();
          const maxChanceValue = chanceArray.reduce((total, chanceValue) => total + chanceValue);

          await expect(
            randomIpfsNft.getBreedFromModdedRng(maxChanceValue),
          ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__RangeOutOfBounds");
        });
      });
    })
  : describe.skip;
