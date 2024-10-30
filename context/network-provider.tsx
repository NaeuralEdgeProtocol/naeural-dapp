"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export type Network = "arbitrum" | "sepolia";

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const NETWORK_CONFIGS = {
  arbitrum: {
    chainId: "0xA4B1", // 42161
    chainName: "Arbitrum One",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://arbiscan.io/"],
  },
  sepolia: {
    chainId: "0xaa36a7", // 11155111
    chainName: "Sepolia",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

const chainIdToNetwork: { [key: string]: Network } = {
  "0xA4B1": "arbitrum",
  "0xaa36a7": "sepolia",
};

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [network, setNetworkState] = useState<Network>("arbitrum");

  const getCurrentNetwork = async () => {
    try {
      // @ts-ignore
      const provider = window.ethereum;
      if (!provider) return;

      const chainId = await provider.request({ method: "eth_chainId" });
      const currentNetwork = chainIdToNetwork[chainId];

      if (currentNetwork) {
        setNetworkState(currentNetwork);
      }
    } catch (error) {
      console.error("Failed to get current network:", error);
    }
  };

  const switchNetwork = async (targetNetwork: Network) => {
    try {
      // @ts-ignore
      const provider = window.ethereum;
      if (!provider) {
        throw new Error("MetaMask not found");
      }

      try {
        // First try to switch to the network
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: NETWORK_CONFIGS[targetNetwork].chainId }],
        });
      } catch (switchError: any) {
        // If the network is not added to MetaMask, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [NETWORK_CONFIGS[targetNetwork]],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      toast.error(`Failed to switch network: ${error.message}`);
      throw error;
    }
  };

  // Initialize network state and listen for changes
  useEffect(() => {
    const initNetwork = async () => {
      try {
        // @ts-ignore
        const provider = window.ethereum;
        if (!provider) return;

        // Get initial network state
        await getCurrentNetwork();

        // Listen for network changes in MetaMask
        provider.on("chainChanged", (chainId: string) => {
          const newNetwork = chainIdToNetwork[chainId];
          if (newNetwork) {
            setNetworkState(newNetwork);
          }
        });

        return () => {
          provider.removeListener("chainChanged", () => {});
        };
      } catch (error) {
        console.error("Failed to initialize network:", error);
      }
    };

    initNetwork();
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork: switchNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
