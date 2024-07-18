"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import confetti from "canvas-confetti";
import { Snippet } from "@nextui-org/snippet";
import { ethers } from "ethers";
import { useSDK } from "@metamask/sdk-react";

import { useNetwork } from "@/context/network-provider";
import {
  PlusIcon,
  PublicLicenseIcon,
  MasterLicenseIcon,
  VerticalDotsIcon, EthIcon,
} from '@/components/icons';
import {
  getAddLicenseTransaction,
  getClaimRewardsTransaction,
  getEstimateRewards,
  getLicensePrice,
  getLicenses,
  getRegisterLicenseTransaction,
} from "@/api";
import { License } from "@/types/license";
import { CustomCard } from '@/components/custom-card';

const columns = [
  { name: "LICENSE", uid: "id", sortable: true },
  { name: "NODE", uid: "nodeHash", sortable: true },
  { name: "REDEEMABLE", uid: "estimateRewards" },
  { name: "", uid: "actions" },
];

// @ts-ignore
export default function LicenseTable() {
  const { network } = useNetwork();
  const { account } = useSDK();
  const [rewards, setRewards] = useState<{ [key: string]: number }>({});

  const {
    isOpen: isRegisterOpen,
    onOpen: onRegisterOpen,
    onOpenChange: onRegisterOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onOpenChange: onDetailsOpenChange,
  } = useDisclosure();
  const {
    isOpen: isBuyOpen,
    onOpen: onBuyOpen,
    onOpenChange: onBuyOpenChange,
  } = useDisclosure();

  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [licensesAmount, setLicensesAmount] = useState(1);
  const [nodeHash, setNodeHash] = useState("");
  const [licensePrice, setLicensePrice] = useState(0);

  // @ts-ignore
  const provider = new ethers.BrowserProvider(window.ethereum);
  const handleLicensePrice = async (amount: number) => {
    const price = await getLicensePrice(network, "license");

    setLicensePrice(price * amount * 100);
  };

  useEffect(() => {
    if (account) {
      getLicensesData();

      const intervalId = setInterval(getLicensesData, 5000); // Update every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    const fetchRewards = async () => {
      for (const license of licenses) {
        license.estimateRewards = await getEstimateRewards(
          network,
          "license",
          account,
          licenses,
        );
      }
    };

    if (account && licenses.length > 0) {
      fetchRewards();
    }
  }, [licenses, account, network]);

  const getLicensesData = async () => {
    console.log("refresh");
    const licenses = await getLicenses(network, "license", account);

    setLicenses(licenses);
  };

  const claimRewards = async (licenseList: License[]) => {
    const transaction = await getClaimRewardsTransaction(
      network,
      "license",
      account,
      licenseList,
    );

    await provider.send("eth_sendTransaction", [transaction]);
  };

  const buyLicense = async () => {
    const transaction = await getAddLicenseTransaction(
      network,
      "license",
      account,
      licensesAmount,
    );

    await provider.send("eth_sendTransaction", [transaction]);
  };

  const registerLicense = async () => {
    const transaction = await getRegisterLicenseTransaction(
      network,
      "license",
      account,
      selectedLicense?.id,
      nodeHash,
    );

    await provider.send("eth_sendTransaction", [transaction]);
  };

  const renderCell = React.useCallback(
    (license: License, columnKey: React.Key) => {
      const cellValue = license[columnKey as keyof License];

      switch (columnKey) {
        case "id":
          return (
            <>
              <div className="flex z-10 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased rounded-t-large gap-2 pb-0">
                <div className="flex justify-center p-2 rounded-full items-center bg-secondary-100/80 text-pink-500">
                  {license.type == "master" ? (
                    <MasterLicenseIcon />
                  ) : (
                    <PublicLicenseIcon />
                  )}
                </div>
                <h3 className="tracking-tight text-lg inline font-semibold">
                  #{license.id}
                </h3>
              </div>
            </>
          );
        case "nodeHash":
          if (cellValue) {
            return (
              <Snippet size="sm" symbol="">
                {cellValue}
              </Snippet>
            );
          } else {
            return (
              <Link
                className="cursor-pointer text-sm"
                onPress={() => {
                  setSelectedLicense(license);
                  onRegisterOpen();
                }}
              >
                No active license found for your node. Please register a valid
                license
              </Link>
            );
          }
        case "lastClaimCycle":
          return <div>{license.lastClaimCycle}</div>;
        case "estimateRewards":
          return (
            <div>
              {rewards[license.id] || (
                <Skeleton className="w-2/5 rounded-lg">
                  <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                </Skeleton>
              )}
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown className="bg-background border-1 border-default-200">
                <DropdownTrigger>
                  <Button isIconOnly radius="full" size="sm" variant="light">
                    <VerticalDotsIcon className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    onClick={() => {
                      setSelectedLicense(license);
                      onDetailsOpen();
                    }}
                  >
                    Details
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      claimRewards([license]);
                    }}
                  >
                    Claim Rewards
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [licenses],
  );

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div />
          <div className="flex gap-3">
            <Button
              color="success"
              onClick={() => {
                claimRewards(licenses).then(() => {
                  confetti();
                });
              }}
            >
              Claim Rewards
            </Button>
            <Button
              color="primary"
              endContent={<PlusIcon />}
              onPress={onBuyOpen}
            >
              Buy License
            </Button>
          </div>
        </div>
      </div>
    );
  }, [licenses.length]);

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No licenses found"} items={licenses}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isRegisterOpen} onOpenChange={onRegisterOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Register License
              </ModalHeader>
              <ModalBody>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Input
                    label="Node Hash"
                    placeholder="Enter node hash"
                    type="text"
                    onChange={(e) => setNodeHash(e.target.value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    registerLicense();
                    onClose();
                  }}
                >
                  Register
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDetailsOpen} onOpenChange={onDetailsOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                License Details
              </ModalHeader>
              <ModalBody>
                {selectedLicense && (
                  <>
                    <p>
                      <strong>License ID:</strong> #{selectedLicense.id}
                    </p>
                    <Snippet size="sm" symbol="">
                      {selectedLicense.nodeHash || 'Not assigned'}
                    </Snippet>
                    <div className="flex">
                      <CustomCard icon={<EthIcon />} value={selectedLicense.currentClaimAmount} title="Redeemed" />
                    </div>
                    <div className="flex">
                      <CustomCard icon={<EthIcon />} value={selectedLicense.remainingClaimAmount} title="Remaining" />
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isBuyOpen} onOpenChange={onBuyOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Buy License
              </ModalHeader>
              <ModalBody>
                <p>
                  You are about to buy new licenses. Please confirm the number
                  of licenses.
                </p>

                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Input
                    label="No. of licenses"
                    max="5"
                    placeholder="3"
                    type="number"
                    onChange={(e) => {
                      setLicensesAmount(+e.target.value);
                      handleLicensePrice(+e.target.value);
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    buyLicense();
                    onClose();
                  }}
                >
                  {licensePrice ? (
                    <span>Buy for {licensePrice}$</span>
                  ) : (
                    <span>Buy</span>
                  )}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
