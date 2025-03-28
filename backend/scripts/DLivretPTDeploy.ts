import { ethers } from "hardhat";

async function main() {
  // Deploy the Voting contract
  const dlivretContract = await ethers.deployContract("DLivretPT", ["0x9Df192D13D61609D1852461c4850595e1F56E714","0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"]);

  // Wait for the contract to be deployed
  await dlivretContract.waitForDeployment();

  // Log the address of the deployed contract
  console.log(`contract DLivretPT is Ownable {
 contract deployed to ${dlivretContract.target}`);
}

// Handle errors and exit the process if an error occurs
main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});
