'use client'
import { Button } from "@/components/ui/button"

// react
import { useState, useEffect } from "react";

// wagmi
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

// contract
import { contractAddress, contractAbi } from "@/constants/DLivretPTContract";

// approve function
import { approveDLivretPT } from "./ApproveDLivretPT";

const ContractTest: React.FC = () => {

    const { data: hash, error, isPending: writeIsPending, writeContract } = useWriteContract({
        mutation: {
          // onSuccess: () => {
    
          // },
          // onError: (error) => {
    
          // }
        }
      })

      const [amountIn, setAmountIn] = useState(100)
    
      const buyPT = async() => {
    
        writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'buyPT',
          args: [amountIn *10**18] // USDe amount
        })    
      }

      const approveAndBuyPT = async () => {
        try {
          await approveDLivretPT();
          await buyPT();
        } catch (error) {
          console.error("Error during approval or purchase:", error);
        }
      };

    return (
      <>
        <Button variant="outline" disabled={writeIsPending} onClick={approveDLivretPT}>approveDLivretPT</Button>
        <Button variant="outline" disabled={writeIsPending} onClick={buyPT}>Buy PT USDe</Button>
        <Button variant="outline" disabled={writeIsPending} onClick={approveAndBuyPT}>Both</Button>
      </>
    );
};

export default ContractTest;