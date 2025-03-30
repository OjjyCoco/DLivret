import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  // Replace with your actual deployed contract address
  const contractAddress = "0xa86582Ad5E80abc19F95f8A9Fb3905Cda0dAbd59"; 

  // Attach to an already deployed contract
  const dlivretTicket = await ethers.getContractAt("DLivretTicket", contractAddress);

  // Allow DLivretPT to mint tickets
  const tx = await dlivretTicket.connect(owner).addContractCaller("0x97915c43511f8cB4Fbe7Ea03B96EEe940eC4AF12");
  await tx.wait(); // Wait for transaction confirmation

  console.log(`addContractCaller executed on DLivretTicket at ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
