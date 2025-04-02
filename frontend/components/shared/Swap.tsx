'use client'
import { useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"

// wagmi
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

// contract
import { contractAddress, contractAbi } from "@/constants/DLivretPTContract";

// approve function
import { approveDLivretPT } from "./ApproveDLivretPT";

export default function SwapComponent() {

    const { data: hash, error, isPending: writeIsPending, writeContract } = useWriteContract({
        mutation: {
          // onSuccess: () => {
    
          // },
          // onError: (error) => {
    
          // }
        }
      })

      const [amountUSDeIn, setAmountUSDeIn] = useState(0)
      const [amountPTUSDeIn, setAmountPTUSDeIn] = useState(0)
    
      const buyPT = async() => {
    
        writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'buyPT',
          args: [amountUSDeIn *10**18]
        })    
      }

      const sellPT = async() => {
    
        writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'sellPT',
          args: [amountPTUSDeIn *10**18]
        })    
      }


  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        
      <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-2">Acheter des PT USDe</p>
        <Input
        type="number"
        placeholder="0 USDe"
        className="text-black text-xl font-semibold py-2 px-3 border border-gray-300 rounded-lg"
        onChange={(amountUSDe) => setAmountUSDeIn(Number(amountUSDe.target.value))}
        />
        <div className="mt-4">
        <Button 
        variant="outline"
        disabled={writeIsPending}
        onClick={buyPT}
        className="text-gray-700 border-gray-400 bg-white 
                    dark:bg-gray-100 dark:text-gray-900 
                    dark:hover:bg-gray-300 rounded-2xl 
                    shadow-md hover:bg-gradient-to-r 
                    hover:from-gray-800 hover:to-gray-600 
                    hover:text-white transition-all duration-300"
        >
        Acheter {amountUSDeIn} PT USDe
        </Button>
        </div>
      </div>

      <div className="flex flex-col items-center my-3">
        <FaArrowDown className="text-gray-400 text-lg" />
        <p className="text-gray-500 text-xs mt-1">Revenez plus tard</p>
        <FaArrowDown className="text-gray-400 text-lg mt-1" />
      </div>

      <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-2">Vendre mes PT USDe</p>
        <Input
        type="number"
        placeholder="0 PT USDe"
        className="text-black text-xl font-semibold py-2 px-3 border border-gray-300 rounded-lg"
        onChange={(amountPTUSDe) => setAmountPTUSDeIn(Number(amountPTUSDe.target.value))}
        />

        <div className="mt-4">
            <Button 
            variant="outline"
            disabled={writeIsPending}
            onClick={sellPT}
            className="text-gray-700 border-gray-400 bg-white 
                        dark:bg-gray-100 dark:text-gray-900 
                        dark:hover:bg-gray-300 rounded-2xl 
                        shadow-md hover:bg-gradient-to-r 
                        hover:from-gray-800 hover:to-gray-600 
                        hover:text-white transition-all duration-300"
            >
            Vendre {amountPTUSDeIn} PT USDe
            </Button>
        </div>
      </div>
    </div>
  );
}
