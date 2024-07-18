"use client";

import { Spinner } from "@nextui-org/react";

import { EthIcon, HourglassIcon, Logo } from '@/components/icons';
import LicenseTable from '@/components/license-table';
import { CustomCard } from '@/components/custom-card';
import { useSDK } from '@metamask/sdk-react';
import { useNetwork } from '@/context/network-provider';
import React, { useEffect, useState } from 'react';
import Login from '@/components/login';
import { getAccountData } from '@/api';

export default function Home() {
  const { network } = useNetwork();
  const { connected, account } = useSDK();
  const naeuralPrice = 0.02;

  const [loading, setLoading] = useState(true);
  const [naeuralBalance, setNaeuralBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);

  const getAccountInfo = async () => {
    const data = await getAccountData(network, account);

    setNaeuralBalance(data.tokenBalances[1].amount);
    setEthBalance(data.tokenBalances[0].amount);
    setCurrentEpoch(data.currentEpoch);
  };

  useEffect(() => {
    if (account) {
      getAccountInfo().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [connected]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
        <Spinner color="white" />
      </div>
    );
  }

  if (connected) {
    return (
      <>
        <div className="flex items-center justify-center gap-3">
          <CustomCard icon={<Logo />} value={naeuralBalance} subvalue={(naeuralBalance * naeuralPrice).toFixed(3)} title="NAEURAL Balance" />
          <CustomCard icon={<EthIcon />} value={ethBalance} title="ETH Balance" />
          <CustomCard icon={<HourglassIcon />} value={currentEpoch} title="Current Epoch" />
        </div>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <LicenseTable></LicenseTable>
        </section>
      </>
    );
  } else {
    return (
      <Login />
    );
  }
}
