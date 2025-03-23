import { ethers } from "hardhat";

async function main() {
  // Deploy the Voting contract
  const dlivretContract = await ethers.deployContract("RouterSampleUSDe");

  // Wait for the contract to be deployed
  await dlivretContract.waitForDeployment();

  // Log the address of the deployed contract
  console.log(`RouterSampleUSDe contract deployed to ${dlivretContract.target}`);
}

// Handle errors and exit the process if an error occurs
main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});
