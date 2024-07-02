import hre from "hardhat";
import { deployBasicNft } from "./deployBasicNft";

async function main() {
  await hre.run("compile");
  await deployBasicNft();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
