import { ethers } from "ethers";

type NetworkConfigItem = {
  name: string;
  vrfCoordinatorV2Plus: string;
  gasLane: string;
  subscriptionId: string;
  callbackGasLimit: string;
  mintFee: string;
  ethUsdPriceFeed: string;
};

type NetworkConfigInfo = {
  [key: number]: NetworkConfigItem;
};

const networkConfig: NetworkConfigInfo = {
  31337: {
    name: "localhost",
    vrfCoordinatorV2Plus: "",
    gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    subscriptionId: "",
    callbackGasLimit: "500000",
    mintFee: "10000000000000000",
    ethUsdPriceFeed: "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910",
  },
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2Plus: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    subscriptionId: "17764036186583325586525437155678008358772205049493993790544528906682153407932",
    callbackGasLimit: "500000",
    mintFee: "10000000000000000",
    ethUsdPriceFeed: "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910",
  },
};

const developmentChains = ["hardhat", "localhost"];
const VRF_SUB_FUND_AMOUNT = ethers.parseEther("25");

export { VRF_SUB_FUND_AMOUNT, developmentChains, networkConfig };
