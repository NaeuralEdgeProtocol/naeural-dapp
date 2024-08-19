import React, { createContext, useState, useContext, ReactNode } from "react";

export type Network = "sepolia" | "arbitrum";

const NetworkContext = createContext<
  | {
      network: Network;
      setNetwork: React.Dispatch<React.SetStateAction<Network>>;
    }
  | undefined
>(undefined);

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }

  return context;
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>("arbitrum");

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}
