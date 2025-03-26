'use client'
import { Button } from "@/components/ui/button"

// react
import { useState, useEffect } from "react";

// wagmi
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

// contract
import { contractAddress, contractAbi } from "@/constants";

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

    return (
        <Button variant="outline" disabled={writeIsPending} onClick={buyPT}>Buy PT USDe</Button>
    );
};

export default ContractTest;