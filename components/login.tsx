"use client";

import { ConnectWalletButton } from '@/components/connect-wallet';
import React, { useEffect } from 'react';
import { Logo, MetamaskIcon, WalletIcon } from '@/components/icons';
import { Button } from '@nextui-org/button';
import { useSDK } from '@metamask/sdk-react';

export default function Login() {
  const { sdk, connected, connecting, account } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn(`No accounts found`, err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <div className="flex h-full  w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center pb-6">
            <Logo size={100}/>
            <p className="text-xl font-medium">Welcome Back</p>
            <p className="text-small text-default-500">Connect your wallet to continue</p>
          </div>
          <div className="mt-2 flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 py-6 shadow-small">
            <div className="flex flex-col gap-2">
              <Button
                color="default"
                variant="bordered"
                startContent={<MetamaskIcon width={18} height={19}/>}
                disabled={connecting}
                onClick={connect}
              >
                Continue with Metamask
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
