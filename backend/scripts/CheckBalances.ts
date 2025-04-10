import { ethers } from "hardhat";

// USDe contract address on the local Hardhat fork (update if necessary)
const USDeAddress = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // USDe Token Address
const PTUSDeAddress = "0x917459337CaAC939D41d7493B3999f571D20D667";
const ticketAddress = "0x7722f5d7964a04672761cdfdC7c17B7Ac8f197b7";

async function main() {
  // List of addresses to check balances for
  const addresses = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",  // Replace with actual addresses
    "0x1f015774346BFfe5941703ea429CE8b0B6C875D6",  // Replace with actual addresses
  ];

  // Connect to the USDe contract
  const signer = await ethers.getSigner("0x1f015774346BFfe5941703ea429CE8b0B6C875D6"); // We just need one signer (anyone)
  const usdeContract = await ethers.getContractAt("IERC20", USDeAddress, signer);

  // Iterate over each address and fetch the balance
  for (const address of addresses) {
    console.log(`Checking balance for address: ${address}`);
    
    try {
      // Fetch the balance
      const balanceInWei = await usdeContract.balanceOf(address);
      const balanceFormatted = ethers.formatUnits(balanceInWei, 18); // Format to decimal places (18 decimals)

      console.log(`USDe balance of ${address}: ${balanceFormatted} USDe`);
    } catch (error) {
      console.error(`Error fetching balance for ${address}: ${error}`);
    }
  }

  console.log("=======================")

  const ptusdeContract = await ethers.getContractAt("IERC20", PTUSDeAddress, signer);

  // Iterate over each address and fetch the balance
  for (const address of addresses) {
    console.log(`Checking balance for address: ${address}`);
    
    try {
      // Fetch the balance
      const balanceInWei = await ptusdeContract.balanceOf(address);
      const balanceFormatted = ethers.formatUnits(balanceInWei, 18); // Format to decimal places (18 decimals)

      console.log(`PT USDe balance of ${address}: ${balanceFormatted} PT USDe`);
    } catch (error) {
      console.error(`Error fetching balance for ${address}: ${error}`);
    }
  }

  console.log("=======================")

  
  const dlivretTicketContract = await ethers.getContractAt("IERC1155", ticketAddress, signer);
  const block = await ethers.provider.getBlock("latest");
  const ticketId = Math.floor(block.timestamp / (7 * 24 * 60 * 60));

  const tokenBalance = await dlivretTicketContract.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", ticketId);
  console.log(`$User SFT balance ID ${ticketId} : ${tokenBalance}`);


}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
