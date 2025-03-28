import { ethers } from "hardhat";

    const USDe_ADDRESS = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // USDe token
    const USER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Adresse générée par Hardhat

    async function main() {

    const usde = await ethers.getContractAt("IERC20", USDe_ADDRESS);
    const signer = await ethers.getSigner(USER); // Your address

    // Approve your deployed DLivretPT contract (replace with actual deployed address)
    const routerAddress = "0x67832b9Fc47eb3CdBF7275b95a29740EC58193D2"; // DLivret address
    const amount = ethers.parseUnits("100", 18); // Approving 100 USDe

    const tx = await usde.connect(signer).approve(routerAddress, amount);
    await tx.wait();

    console.log("Approval successful!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
