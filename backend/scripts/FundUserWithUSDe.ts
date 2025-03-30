import { ethers } from "hardhat";

const USDe_ADDRESS = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // USDe token
const WHALE_ADDRESS = "0x1f015774346BFfe5941703ea429CE8b0B6C875D6"; // Adresse qui détient beaucoup de USDe sur le Mainnet
const USER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Adresse générée par Hardhat

async function main() {
    // Impersonate the whale account
    await ethers.provider.send("hardhat_impersonateAccount", [WHALE_ADDRESS]);
    
    const signer = await ethers.getSigner(WHALE_ADDRESS);
    const usde = await ethers.getContractAt("IERC20", USDe_ADDRESS, signer);

    const amount = ethers.parseUnits("100", 18); // 100 USDe

    console.log(`Transferring ${ethers.formatUnits(amount, 18)} USDe to ${USER}...`);

    const tx = await usde.transfer(USER, amount);
    await tx.wait();

    console.log(`Transfer successful!`);

    // Check balance of MY_WALLET after transfer
    const balance = await usde.balanceOf(USER);
    console.log(`New USDe balance of ${USER}: ${ethers.formatUnits(balance, 18)} USDe`);

    const balanceWhale = await usde.balanceOf(WHALE_ADDRESS);
    console.log(`New USDe balance of ${WHALE_ADDRESS}: ${ethers.formatUnits(balanceWhale, 18)} USDe`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
