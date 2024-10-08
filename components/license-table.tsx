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
// @ts-ignore
import confetti from "canvas-confetti";
import { Snippet } from "@nextui-org/snippet";
import { ethers } from "ethers";
import { useSDK } from "@metamask/sdk-react";
import { toast } from "react-toastify";
import { Chip } from "@nextui-org/chip";
import { FiChevronsUp } from "react-icons/fi";

import { useNetwork } from "@/context/network-provider";
import {
  PlusIcon,
  PublicLicenseIcon,
  MasterLicenseIcon,
  VerticalDotsIcon,
  Logo,
} from "@/components/icons";
import {
  approve,
  getAddLicenseTransaction,
  getClaimRewardsTransaction,
  getEstimateRewards,
  getLicensePrice,
  getLicenses,
  getRegisterLicenseTransaction,
} from "@/api";
import { License } from "@/types/license";
import { CustomCard } from "@/components/custom-card";
import "react-toastify/dist/ReactToastify.css";

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
  const [masterRewards, setMasterRewards] = useState<{ [key: string]: number }>(
    {},
  );
  const [licenseRewards, setLicenseRewards] = useState<{
    [key: string]: number;
  }>({});

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
    console.log(price);

    setLicensePrice(price * amount);
  };

  useEffect(() => {
    if (account) {
      getLicensesData();

      const intervalId = setInterval(getLicensesData, 30000); // Update every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [account, network]);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!account) {
        return;
      }

      const masterLicenses = [];
      const publicLicenses = [];

      for (const license of licenses) {
        if (license.type === "license") {
          publicLicenses.push(license);
        } else {
          masterLicenses.push(license);
        }
      }

      if (publicLicenses.length > 0) {
        const newLicenseRewards = {};
        const licenseRewards = await getEstimateRewards(
          network,
          "license",
          account,
          publicLicenses,
        );

        if (licenseRewards.statusCode === 500 || licenseRewards.length === 0) {
          for (const publicLicense of publicLicenses) {
            // @ts-ignore
            newLicenseRewards[publicLicense.id] = 0;
          }
          setLicenseRewards(newLicenseRewards);

          return;
        }

        for (const licenseReward of licenseRewards) {
          // @ts-ignore
          newLicenseRewards[licenseReward.licenseId] = licenseReward.rewards;
        }

        setLicenseRewards(newLicenseRewards);
      }

      if (masterLicenses.length > 0) {
        const newMasterRewards = {};
        const masterRewards = await getEstimateRewards(
          network,
          "master",
          account,
          masterLicenses,
        );

        if (masterRewards.statusCode === 500 || masterRewards.length === 0) {
          for (const masterLicense of masterLicenses) {
            // @ts-ignore
            newMasterRewards[masterLicense.id] = 0;
          }
          setMasterRewards(newMasterRewards);

          return;
        }

        for (const masterReward of masterRewards) {
          // @ts-ignore
          newMasterRewards[masterReward.licenseId] = masterReward.rewards;
        }

        setMasterRewards(newMasterRewards);
      }
    };

    if (account && licenses.length > 0) {
      fetchRewards();
    }
  }, [licenses, account, network]);

  const getLicensesData = async () => {
    if (!account) return;
    const masterLicenses = await getLicenses(network, "master", account);
    const licenses = await getLicenses(network, "license", account);

    setLicenses([...masterLicenses, ...licenses]);
  };

  const claimRewards = async (licenseList: License[]) => {
    if (!account) return;
    const masterLicenses = [];
    const publicLicenses = [];

    for (const license of licenseList) {
      if (license.type === "license") {
        publicLicenses.push(license);
      } else {
        masterLicenses.push(license);
      }
    }

    if (masterLicenses.length > 0) {
      const masterTransaction = await toast.promise(
        getClaimRewardsTransaction(network, "master", account, licenseList),
        {
          pending: "Preparing transaction...",
          success: "Transaction prepared 👌",
          error: "Failed to prepare transaction 🤯",
        },
      );

      await toast.promise(
        provider.send("eth_sendTransaction", [masterTransaction]),
        {
          pending: "Claiming master rewards",
          success: "Rewards successfully claimed 👌",
          error: "Something went wrong. Please try again 🤯",
        },
      );
    }

    if (publicLicenses.length > 0) {
      const transaction = await toast.promise(
        getClaimRewardsTransaction(network, "license", account, licenseList),
        {
          pending: "Preparing transaction...",
          success: "Transaction prepared 👌",
          error: "Failed to prepare transaction 🤯",
        },
      );

      await toast.promise(provider.send("eth_sendTransaction", [transaction]), {
        pending: "Claiming rewards",
        success: "Rewards successfully claimed 👌",
        error: "Something went wrong. Please try again 🤯",
      });
    }
  };

  const buyLicense = async () => {
    if (!account) return;
    const approvalTransaction = await toast.promise(
      approve(network, licensesAmount, account),
      {
        pending: "Preparing transaction...",
        success: "Transaction prepared 👌",
        error: "Failed to prepare transaction 🤯",
      },
    );

    await toast.promise(
      provider.send("eth_sendTransaction", [approvalTransaction]),
      {
        pending: "Approving transaction",
        success: "Transaction successfully approved 👌",
        error: "Something went wrong. Please try again 🤯",
      },
    );

    const buyTransaction = await toast.promise(
      getAddLicenseTransaction(network, "license", account, licensesAmount),
      {
        pending: "Preparing transaction...",
        success: "Transaction prepared 👌",
        error: "Failed to prepare transaction 🤯",
      },
    );

    await toast.promise(
      provider.send("eth_sendTransaction", [buyTransaction]),
      {
        pending: "Buying license",
        success: "License successfully bought 👌",
        error: "Something went wrong. Please try again 🤯",
      },
    );
  };

  const registerLicense = async () => {
    if (!selectedLicense) return;
    if (!account) return;
    const transaction = await toast.promise(
      getRegisterLicenseTransaction(
        network,
        selectedLicense.type,
        account,
        selectedLicense.id,
        nodeHash,
      ),
      {
        pending: "Preparing transaction...",
        success: "Transaction prepared 👌",
        error: "Failed to prepare transaction 🤯",
      },
    );

    await toast.promise(provider.send("eth_sendTransaction", [transaction]), {
      pending: "Register license",
      success: "License successfully registered 👌",
      error: "Something went wrong. Please try again 🤯",
    });
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
                #{license.id}
                {license.nodePower && (
                  <Chip
                    className="ml-2"
                    color="success"
                    size="sm"
                    startContent={<FiChevronsUp />}
                    variant="faded"
                  >
                    {license.nodePower}x
                  </Chip>
                )}
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
              {license.type === "master" ? (
                license.id in masterRewards ? (
                  masterRewards[license.id]
                ) : (
                  <Skeleton className="w-2/5 rounded-lg">
                    <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                  </Skeleton>
                )
              ) : license.id in licenseRewards ? (
                licenseRewards[license.id]
              ) : (
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
                  <DropdownItem
                    onClick={() => {
                      setSelectedLicense(license);
                      onRegisterOpen();
                    }}
                  >
                    Register License
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
                      <strong>ID:</strong> #{selectedLicense.id}
                    </p>
                    <Snippet size="sm" symbol="">
                      {selectedLicense.nodeHash || "Not assigned"}
                    </Snippet>
                    <div className="flex">
                      <CustomCard
                        ctaEnabled={false}
                        ctaLink={undefined}
                        ctaText={undefined}
                        icon={<Logo />}
                        title="Redeemed"
                        value={selectedLicense.currentClaimAmount}
                      />
                    </div>
                    <div className="flex">
                      <CustomCard
                        ctaEnabled={false}
                        ctaLink={undefined}
                        ctaText={undefined}
                        icon={<Logo />}
                        title="Remaining"
                        value={selectedLicense.remainingClaimAmount}
                      />
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
