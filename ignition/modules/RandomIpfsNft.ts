import { type IgnitionModuleResult, buildModule } from "@nomicfoundation/ignition-core";

export default buildModule<
  "RandomIpfsNftModule",
  "RandomIpfsNft",
  IgnitionModuleResult<"RandomIpfsNft">
>("RandomIpfsNftModule", (m) => {
  console.log("----------------------------------------");
  const vrfCoordinatorV2_5Address = m.getParameter("vrfCoordinatorV2_5Address");
  const subscriptionId = m.getParameter("subscriptionId");
  const tokenUris = m.getParameter("tokenUris");
  const gasLane = m.getParameter("gasLane");
  const callbackGasLimit = m.getParameter("callbackGasLimit");
  const mintFee = m.getParameter("mintFee");
  const deployer = m.getAccount(0);

  const randomIpfsNft = m.contract(
    "RandomIpfsNft",
    [subscriptionId, vrfCoordinatorV2_5Address, gasLane, callbackGasLimit, tokenUris, mintFee],
    {
      from: deployer,
    },
  );

  console.log("RandomIpfsNft Deployed!");

  return { randomIpfsNft };
});
