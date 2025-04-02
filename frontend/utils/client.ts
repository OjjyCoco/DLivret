import { createPublicClient, http } from "viem";
import { sepolia, hardhat } from 'viem/chains';

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

export const publicClient = createPublicClient({
    chain: hardhat,
    transport: http("http://127.0.0.1:8545")
})