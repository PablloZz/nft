import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { type IgnitionModuleResult } from "@nomicfoundation/ignition-core";
import { ethers } from "ethers";

const BASE_FEE = ethers.parseUnits("1", 17); // 0.25 is the premium. It costs 0.25 LINK.
const GAS_PRICE_LINK = 1000000000; // Link per gas. Calculated based on the gas price of the chain.
const WEI_PER_UNIT_LINK = 4300845385139956;

export default buildModule<
  "VRFCoordinatorV2_5MockModule",
  "VRFCoordinatorV2_5Mock",
  IgnitionModuleResult<"VRFCoordinatorV2_5Mock">
>("VRFCoordinatorV2_5MockModule", (m) => {
  const baseFee = m.getParameter("baseFee", BASE_FEE);
  const gasPriceLink = m.getParameter("gasPriceLink", GAS_PRICE_LINK);
  const weiPerUnitLink = m.getParameter("weiPerUnitLink", WEI_PER_UNIT_LINK);
  const deployer = m.getAccount(0);
  const args = [baseFee, gasPriceLink, weiPerUnitLink];
  console.log("Local network detected! Deploying mocks...");
  const vrfCoordinatorV2_5Mock = m.contract("VRFCoordinatorV2_5Mock", args, {
    from: deployer,
  });

  console.log("Mocks Deployed!");
  console.log("------------------------------------");

  return { vrfCoordinatorV2_5Mock };
});
