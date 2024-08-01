import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { type IgnitionModuleResult } from "@nomicfoundation/ignition-core";
import { ethers } from "ethers";

const DECIMALS = "18";
const INITIAL_PRICE = ethers.parseUnits("200", "ether");

export default buildModule<
  "MockV3AggregatorModule",
  "MockV3Aggregator",
  IgnitionModuleResult<"MockV3Aggregator">
>("MockV3AggregatorModule", (m) => {
  const decimals = m.getParameter("decimals", DECIMALS);
  const initialPrice = m.getParameter("initialPrice", INITIAL_PRICE);
  const deployer = m.getAccount(0);
  const args = [decimals, initialPrice];
  console.log("Local network detected! Deploying mocks...");
  
  const mockV3Aggregator = m.contract("MockV3Aggregator", args, {
    from: deployer,
  });

  console.log("Mocks Deployed!");
  console.log("------------------------------------");

  return { mockV3Aggregator };
});
