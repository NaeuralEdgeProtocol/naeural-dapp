"use client";

import { Spinner } from "@nextui-org/react";

import { EthIcon, HourglassIcon, Logo } from "@/components/icons";
import LicenseTable from "@/components/license-table";
import { CustomCard } from "@/components/custom-card";
import { useSDK } from "@metamask/sdk-react";
import { useNetwork } from "@/context/network-provider";
import React, { useEffect, useState } from "react";
import Login from "@/components/login";
import { getAccountData } from "@/api";
import { FiTriangle } from "react-icons/fi";

export default function Home() {
  const { network } = useNetwork();
  const { connected, account } = useSDK();

  const [loading, setLoading] = useState(true);
  const [naeuralBalance, setNaeuralBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [naeuralPrice, setNaeuralPrice] = useState(0);

  const getAccountInfo = async () => {
    if (!account) return;
    const data = await getAccountData(network, account);

    setNaeuralBalance(data.tokenBalances[1].amount);
    setEthBalance(data.tokenBalances[0].amount);
    setCurrentEpoch(data.currentEpoch);
    setNaeuralPrice(data.tokenPrice);
  };

  useEffect(() => {
    if (account) {
      getAccountInfo().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [connected, network]);

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
          <CustomCard
            icon={<FiTriangle />}
            value={naeuralBalance}
            subvalue={naeuralBalance * naeuralPrice}
            title="NAEURAL Balance"
            ctaEnabled={false}
            ctaText={undefined}
            ctaLink={undefined}
          />
          <CustomCard
            icon={<EthIcon width={undefined} height={undefined} />}
            value={ethBalance}
            title="ETH Balance"
            subvalue={undefined}
            ctaEnabled={false}
            ctaText={undefined}
            ctaLink={undefined}
          />
          <CustomCard
            icon={<HourglassIcon width={undefined} height={undefined} />}
            value={currentEpoch}
            title="Current Epoch"
            subvalue={undefined}
            ctaEnabled={false}
            ctaText={undefined}
            ctaLink={undefined}
          />
        </div>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <LicenseTable></LicenseTable>
        </section>
      </>
    );
  } else {
    return <Login />;
  }
}
