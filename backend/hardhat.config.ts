import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
require("hardhat-gas-reporter");

const ALCHEMY_MAINNET_RPC = process.env.ALCHEMY_MAINNET_RPC || ''

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    L1Etherscan: process.env.ETHERSCAN_API_KEY
  },  
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: ALCHEMY_MAINNET_RPC,
        blockNumber: 22176388
      },
    }
  }
};

export default config;