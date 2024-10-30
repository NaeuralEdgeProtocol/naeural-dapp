import React from "react";
import { Network, useNetwork } from "@/context/network-provider";
import { Select, SelectItem } from "@nextui-org/select";

export default function NetworkSelector() {
  const { network, setNetwork } = useNetwork();

  const handleSelectionChange = async (keys: Set<React.Key>) => {
    try {
      const selectedValue = Array.from(keys).pop() as Network;
      await setNetwork(selectedValue);
    } catch (error) {
      // Error handling is done in the provider
      console.error("Network switch failed:", error);
    }
  };

  return (
    <div className="w-[145px]">
      <Select
        className="max-w-xs"
        selectedKeys={[network]}
        size={undefined}
        onSelectionChange={handleSelectionChange}
      >
        <SelectItem key="arbitrum">Arbitrum</SelectItem>
        <SelectItem key="sepolia">Sepolia ETH</SelectItem>
      </Select>
    </div>
  );
}
