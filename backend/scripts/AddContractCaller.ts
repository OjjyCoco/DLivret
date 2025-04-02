import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  // Replace with your actual deployed contract address
  const dlivretTicketAddress = "0x7722f5d7964a04672761cdfdC7c17B7Ac8f197b7"; 

  // Attach to an already deployed contract
  const dlivretTicket = await ethers.getContractAt("DLivretTicket", dlivretTicketAddress);

  // Allow DLivretPT to mint tickets
  const tx = await dlivretTicket.connect(owner).addContractCaller("0xeA2e668d430e5AA15babA2f5c5edfd4F9Ef6EB73");
  await tx.wait(); // Wait for transaction confirmation

  console.log(`addContractCaller executed on DLivretTicket at ${dlivretTicketAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
