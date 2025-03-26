'use client'
import { ReactNode } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
// import { hardhat } from 'viem/chains';
//import { sepolia } from '@/utils/sepolia';
// import { configSepolia } from '@/utils/wagmi';

interface CustomRainbowKitProviderProps {
    children: ReactNode;
}

const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: 'f10a5b5a8d5f4a76c9bf64db19426141',
    chains: [hardhat],
    ssr: true, // If your dApp uses server side rendering (SSR)
  });

// Tanstack :
const queryClient = new QueryClient();

const RainbowkitProvider = ({ children }: CustomRainbowKitProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
          accentColor: '#1F2937',
          accentColorForeground: 'white',
          borderRadius: 'small',
          fontStack: 'system',
          overlayBlur: 'small',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowkitProvider