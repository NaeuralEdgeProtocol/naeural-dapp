"use client";

import Link from "next/link";

import { WalletIcon} from '@/components/icons';

import { useSDK, MetaMaskProvider } from "@metamask/sdk-react";
import { formatAddress } from "../lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@nextui-org/react';
import { Button } from '@nextui-org/button';
import { Snippet } from '@nextui-org/snippet';
import React from 'react';

export const ConnectWalletButton = () => {
  const { sdk, connected, connecting, account } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn(`No accounts found`, err);
    }
  };

  const disconnect = () => {
    if (sdk) {
      sdk.terminate();
    }
  };

  return (
    <div className="relative">
      {connected ? (
        <Popover>
          <PopoverTrigger>
            <Button>{formatAddress(account)}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Snippet symbol="" size="sm">{account}</Snippet>
            <button
              onClick={disconnect}
              className="block w-full pl-2 pr-4 py-2 text-left text-[#F05252]"
            >
              Disconnect
            </button>
          </PopoverContent>
        </Popover>
      ) : (
        <Button
          disabled={connecting}
          onClick={connect}
          startContent={<WalletIcon width={18} height={19} className="text-white" />}
          variant="flat"
        >Connect</Button>
      )}
    </div>
  );
};