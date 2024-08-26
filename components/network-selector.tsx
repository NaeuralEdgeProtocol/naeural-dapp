import React, { useEffect } from "react";
import { Network, useNetwork } from "@/context/network-provider";
import { Select, SelectItem } from "@nextui-org/select";

export default function NetworkSelector() {
  const { network, setNetwork } = useNetwork();
  const [value, setValue] = React.useState<Network>("arbitrum");

  const handleSelectionChange = (keys: Set<React.Key>) => {
    const selectedValue = Array.from(keys).pop() as Network;
    setValue(selectedValue);
    setNetwork(selectedValue);
  };

  return (
    <div className="w-[145px]">
      <Select
        className="max-w-xs"
        selectedKeys={[value]}
        size={undefined}
        onSelectionChange={handleSelectionChange}
      >
        <SelectItem key="arbitrum">Arbitrum</SelectItem>
        <SelectItem key="sepolia">Sepolia ETH</SelectItem>
      </Select>
    </div>
  );
}
