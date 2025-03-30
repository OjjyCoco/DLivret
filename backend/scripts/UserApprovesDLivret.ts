import { ethers } from "hardhat";

    const USDe_ADDRESS = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // USDe token
    const USER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Adresse générée par Hardhat

    async function main() {

    const usde = await ethers.getContractAt("IERC20", USDe_ADDRESS);
    const signer = await ethers.getSigner(USER); // Your address

    // Approve your deployed DLivretPT contract (replace with actual deployed address)
    const dlivretPTAddress = "0x97915c43511f8cB4Fbe7Ea03B96EEe940eC4AF12"; // DLivretPT address
    const unlimitedApproval = ethers.MaxUint256; // Approve unlimited amount

    const tx = await usde.connect(signer).approve(dlivretPTAddress, unlimitedApproval);
    await tx.wait();

    console.log("Approval successful!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
