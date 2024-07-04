import { type IgnitionModuleResult, buildModule } from "@nomicfoundation/ignition-core";
import { networkConfig } from "../../helper-hardhat-config";
import { network } from "hardhat";

export default buildModule<
  "RandomIpfsNftModule",
  "RandomIpfsNft",
  IgnitionModuleResult<"RandomIpfsNft">
>("RandomIpfsNftModule", (m) => {
  console.log("----------------------------------------");
  const { chainId } = network.config;
  const vrfCoordinatorV2_5Address = m.getParameter("vrfCoordinatorV2_5Address");
  const subscriptionId = m.getParameter("subscriptionId");
  const { gasLane, callbackGasLimit, mintFee } = networkConfig[chainId!];
  const deployer = m.getAccount(0);
  const randomIpfsNft = m.contract(
    "RandomIpfsNft",
    [
      subscriptionId,
      vrfCoordinatorV2_5Address,
      gasLane,
      callbackGasLimit,
      // tokenUrls,
      mintFee,
    ],
    { from: deployer },
  );

  return { randomIpfsNft };
});
