import { type IgnitionModuleResult, buildModule } from "@nomicfoundation/ignition-core";

export default buildModule<"BasicNftModule", "BasicNft", IgnitionModuleResult<"BasicNft">>(
  "BasicNftModule",
  (m) => {
    console.log("----------------------------------------");
    const deployer = m.getAccount(0);
    const basicNft = m.contract("BasicNft", [], {
      from: deployer,
    });

    return { basicNft };
  },
);
