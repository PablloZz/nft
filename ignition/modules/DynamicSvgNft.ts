import { type IgnitionModuleResult, buildModule } from "@nomicfoundation/ignition-core";

export default buildModule<
  "DynamicSvgNftModule",
  "DynamicSvgNft",
  IgnitionModuleResult<"DynamicSvgNft">
>("DynamicSvgNftModule", (m) => {
  console.log("----------------------------------------");
  const deployer = m.getAccount(0);

  const priceFeedAddress = m.getParameter("priceFeedAddress");
  const frownSvg = m.getParameter("frownSvg");
  const happySvg = m.getParameter("happySvg");
  const args = [priceFeedAddress, frownSvg, happySvg];
  const dynamicSvgNft = m.contract("DynamicSvgNft", args, {
    from: deployer,
  });
  console.log("dynamicSvgNft Deployed!");

  return { dynamicSvgNft };
});
