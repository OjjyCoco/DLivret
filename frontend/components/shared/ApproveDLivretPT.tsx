import { ethers } from "ethers";
import { contractAddress, contractAbi } from "@/constants/DLivretPTContract";

export const approveDLivretPT = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const usdeAddress = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
    const PTusdeAddress = "0x917459337CaAC939D41d7493B3999f571D20D667";
    const amount = ethers.MaxUint256;

    const usde = new ethers.Contract(usdeAddress, [
      "function approve(address spender, uint256 amount) public returns (bool)"
    ], signer);
    const ptusde = new ethers.Contract(PTusdeAddress, [
      "function approve(address spender, uint256 amount) public returns (bool)"
    ], signer);

    const usdetx = await usde.approve(contractAddress, amount);
    await usdetx.wait();

    const ptusdetx = await ptusde.approve(contractAddress, amount);
    await ptusdetx.wait();

  } catch (error) {
    console.error("Error:", error);
  }
};
