'use client'
import { useState, useEffect } from "react";
import { FaArrowDown } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// wagmi
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

// contract
import { contractAddress, contractAbi } from "@/constants/DLivretPTContract";

// viem
import { parseAbiItem } from "viem";
import { publicClient } from "@/utils/client";

export default function SwapComponent() {
    const { data: hash, error, isPending: writeIsPending, writeContract } = useWriteContract();

    const [amountUSDeIn, setAmountUSDeIn] = useState(0);
    const [amountPTUSDeIn, setAmountPTUSDeIn] = useState(0);
    // type BuyEvent = {
    //   sender: string;
    //   amountIn: number;
    //   netPtOut: number;
    // };
    // const [buyEvent, setBuyEvent] = useState<BuyEvent | null>(null);
    // type SellEvent = {
    //   sender: string;
    //   amountPtIn: number;
    //   netTokenOut: number;
    // };
    // const [sellEvent, setSellEvent] = useState<SellEvent | null>(null);
    const [transactionType, setTransactionType] = useState<"buy" | "sell" | null>(null);


    const buyPT = async () => {
      setTransactionType("buy");
      writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'buyPT',
          args: [BigInt(amountUSDeIn * 10 ** 18)],
        });
    };
  
  const sellPT = async () => {
      setTransactionType("sell");
      writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'sellPT',
          args: [BigInt(amountPTUSDeIn * 10 ** 18)],
        });
    };
  

    const { isLoading: isConfirming, isSuccess, error: errorConfirmation } = useWaitForTransactionReceipt({
        hash,
    });

    const getBuyEvents = async () => {
      const fromBlock = BigInt(Number(await publicClient.getBlockNumber()) - 2000);
  
      const logs = await publicClient.getLogs({
          address: contractAddress,
          event: parseAbiItem('event BoughtPT(address sender, uint amountIn, uint netPtOut)'),
          fromBlock: fromBlock >= 0 ? fromBlock : BigInt(0),
      });
  
      if (logs.length > 0) {
          const lastLog = logs[logs.length - 1];
  
          const newBuyEvent = {
              sender: lastLog.args?.sender?.toString() || "",
              amountIn: lastLog.args?.amountIn ? Number(lastLog.args.amountIn) / 10 ** 18 : 0,
              netPtOut: lastLog.args?.netPtOut ? Number(lastLog.args.netPtOut) / 10 ** 18 : 0,
          };
  
          // Affichage immédiat du toast
          toast.success(`Transaction réalisée avec succès`, {
              description: `Vous avez reçu ${newBuyEvent.netPtOut} PT USDe`,
              style: { background: "#4CAF50", color: "white" },
              duration: 10000,
          });
  
          // Mise à jour de l'état après l'affichage du toast
        //   setBuyEvent(newBuyEvent);
      }
    };

    const getSellEvents = async () => {
      const fromBlock = BigInt(Number(await publicClient.getBlockNumber()) - 2000);
  
      const logs = await publicClient.getLogs({
          address: contractAddress,
          event: parseAbiItem('event SoldPT(address sender, uint amountPtIn, uint netTokenOut)'),
          fromBlock: fromBlock >= 0 ? fromBlock : BigInt(0),
      });
  
      if (logs.length > 0) {
          const lastLog = logs[logs.length - 1];
  
          const newSellEvent = {
              sender: lastLog.args?.sender?.toString() || "",
              amountPtIn: lastLog.args?.amountPtIn ? Number(lastLog.args.amountPtIn) / 10 ** 18 : 0,
              netTokenOut: lastLog.args?.netTokenOut ? Number(lastLog.args.netTokenOut) / 10 ** 18 : 0,
          };
  
          // Affichage immédiat du toast
          toast.success(`Transaction réalisée avec succès`, {
              description: `Vous avez reçu ${newSellEvent.netTokenOut} USDe`,
              style: { background: "#4CAF50", color: "white" },
              duration: 10000,
          });
  
          // Mise à jour de l'état après l'affichage du toast
        //   setSellEvent(newSellEvent);
      }
    };


  
    useEffect(() => {
      if (isSuccess && transactionType) {
          if (transactionType === "buy") {
              getBuyEvents();
          } else if (transactionType === "sell") {
              getSellEvents();
          }
          setTransactionType(null);
      }
  
      if (errorConfirmation) {
          toast.error("Échec de la transaction", {
              description: errorConfirmation.message,
              style: { background: "#F44336", color: "white" },
              duration: 10000,
          });
      }
  
      if (error) {
          toast.error("Échec de la transaction", {
              description: "La transaction n'a pas pu être envoyée",
              style: { background: "#F44336", color: "white" },
              duration: 10000,
          });
      }
  
      if (writeIsPending) {
          toast("Transaction en cours de validation...", {
              description: "La transaction est en cours de validation",
              duration: 10000,
          });
      }
  
      if (isConfirming) {
          toast("Transaction en cours de confirmation...", {
              description: "La transaction est en cours de confirmation",
              duration: 10000,
          });
      }
    }, [isSuccess, errorConfirmation, error, writeIsPending, isConfirming, transactionType]);
  

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">Acheter des PT USDe</p>
                <Input
                    type="number"
                    placeholder="0 USDe"
                    className="text-black text-xl font-semibold py-2 px-3 border border-gray-300 rounded-lg"
                    onChange={(event) => setAmountUSDeIn(Number(event.target.value))}
                />
                <div className="mt-4">
                    <Button 
                        variant="outline"
                        disabled={writeIsPending}
                        onClick={buyPT}
                        className="text-gray-700 border-gray-400 bg-white dark:bg-gray-100 dark:text-gray-900 
                                   dark:hover:bg-gray-300 rounded-2xl shadow-md hover:bg-gradient-to-r 
                                   hover:from-gray-800 hover:to-gray-600 hover:text-white transition-all duration-300"
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
                    onChange={(event) => setAmountPTUSDeIn(Number(event.target.value))}
                />
                <div className="mt-4">
                    <Button 
                        variant="outline"
                        disabled={writeIsPending}
                        onClick={sellPT}
                        className="text-gray-700 border-gray-400 bg-white dark:bg-gray-100 dark:text-gray-900 
                                   dark:hover:bg-gray-300 rounded-2xl shadow-md hover:bg-gradient-to-r 
                                   hover:from-gray-800 hover:to-gray-600 hover:text-white transition-all duration-300"
                    >
                        Vendre {amountPTUSDeIn} PT USDe
                    </Button>
                </div>
            </div>
        </div>
    );
}
