import { ethers } from "ethers";
import { contractAddress, contractAbi } from "@/constants";

const approveAndBuyPT = async () => {
  try {
    // const provider = new ethers.BrowserProvider(window.ethereum);
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner();

    const usdeAddress = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
    const amount = ethers.parseUnits("100", 18);

    const usde = new ethers.Contract(usdeAddress, [
      "function approve(address spender, uint256 amount) public returns (bool)"
    ], signer);

    console.log("Approving USDe spending...");
    const tx = await usde.approve(contractAddress, amount);
    await tx.wait();
    console.log("Approval successful!");

    // Now call buyPT()
    const router = new ethers.Contract(contractAddress, contractAbi, signer);
    const buyTx = await router.buyPT(ethers.parseUnits("10", 18)); // Buying 10 USDe worth of PT
    await buyTx.wait();
    console.log("buyPT transaction successful!");

  } catch (error) {
    console.error("Error:", error);
  }
};
