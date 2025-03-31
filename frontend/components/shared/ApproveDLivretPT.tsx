import { ethers } from "ethers";
import { contractAddress, contractAbi } from "@/constants/DLivretPTContract";

export const approveDLivretPT = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const usdeAddress = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
    const amount = ethers.MaxUint256;

    const usde = new ethers.Contract(usdeAddress, [
      "function approve(address spender, uint256 amount) public returns (bool)"
    ], signer);

    console.log("Approving USDe spending...");
    const tx = await usde.approve(contractAddress, amount);
    await tx.wait();
    console.log("Approval successful!");

  } catch (error) {
    console.error("Error:", error);
  }
};
