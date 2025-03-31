import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  // Replace with your actual deployed contract address
  const dlivretTicketAddress = "0x039d7496e432c6Aea4c24648a59318b3cbe09942"; 

  // Attach to an already deployed contract
  const dlivretTicket = await ethers.getContractAt("DLivretTicket", dlivretTicketAddress);

  // Allow DLivretPT to mint tickets
  const tx = await dlivretTicket.connect(owner).addContractCaller("0xbF97DEfeb6a387215E3e67DFb988c675c9bb1a29");
  await tx.wait(); // Wait for transaction confirmation

  console.log(`addContractCaller executed on DLivretTicket at ${dlivretTicketAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
