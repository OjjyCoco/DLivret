import { time } from "@nomicfoundation/hardhat-network-helpers";
const { ethers } = require("hardhat");

async function main() {
  const days = 200;
  const seconds = days * 24 * 60 * 60;

  console.log(`Advancing time by ${days} days (${seconds} seconds)...`);

  await time.increase(seconds);

  const latestBlock = await ethers.provider.getBlock("latest");
  const currentTime = new Date(latestBlock.timestamp * 1000).toISOString();

  console.log(`New block timestamp: ${latestBlock.timestamp} (${currentTime})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});