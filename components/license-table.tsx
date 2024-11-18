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
  getUnRegisterLicenseTransaction,
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

interface LicenseTableProps {
  naeuralPrice: number;
}

// @ts-ignore
export default function LicenseTable({ naeuralPrice }: LicenseTableProps) {
  const { network } = useNetwork();
  const { account } = useSDK();

  const [isLoadingLicenses, setIsLoadingLicenses] = useState(true);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [isBuyingLicense, setIsBuyingLicense] = useState(false);
  const [isUnregister, setIsUnregister] = useState(false);


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
    isOpen: isUnRegisterOpen,
    onOpen: onUnRegisterOpen,
    onOpenChange: onUnRegisterOpenChange,
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

  const getLicensesData = async () => {
    if (!account) return;
    setIsLoadingLicenses(true);
    try {
      const masterLicenses = await getLicenses(network, "master", account);
      const licenses = await getLicenses(network, "license", account);
      setLicenses([...masterLicenses, ...licenses]);
    } catch (error) {
      console.error("Failed to fetch licenses:", error);
      toast.error("Failed to fetch licenses");
    } finally {
      setIsLoadingLicenses(false);
    }
  };

  const calculateNaeuralAmount = (usdPrice: number) => {
    return naeuralPrice ? Math.ceil(usdPrice / naeuralPrice) : 0;
  };

  useEffect(() => {
    if (account) {
      getLicensesData();
      const intervalId = setInterval(getLicensesData, 30000);
      return () => clearInterval(intervalId);
    }
  }, [account, network]);

  const fetchRewards = async () => {
    if (!account || licenses.length === 0) {
      setIsLoadingRewards(false);
      return;
    }

    setIsLoadingRewards(true);
    try {
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
        } else {
          for (const licenseReward of licenseRewards) {
            // @ts-ignore
            newLicenseRewards[licenseReward.licenseId] = licenseReward.rewards;
          }
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
        } else {
          for (const masterReward of masterRewards) {
            // @ts-ignore
            newMasterRewards[masterReward.licenseId] = masterReward.rewards;
          }
        }
        setMasterRewards(newMasterRewards);
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      toast.error("Failed to fetch rewards estimates");
    } finally {
      setIsLoadingRewards(false);
    }
  };

  useEffect(() => {
    if (account && licenses.length > 0) {
      fetchRewards();
    }
  }, [licenses, account, network]);

  const handleLicensePrice = async (amount: number) => {
    try {
      const price = await getLicensePrice(network, "license");
      setLicensePrice(price * amount);
    } catch (error) {
      console.error("Failed to get license price:", error);
      toast.error("Failed to fetch license price");
    }
  };

  const claimRewards = async (licenseList: License[]) => {
    if (!account || isClaimingRewards) return;

    setIsClaimingRewards(true);
    try {
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
          getClaimRewardsTransaction(
            network,
            "master",
            account,
            masterLicenses,
          ),
          {
            pending: "Preparing master rewards transaction...",
            success: "Transaction prepared 👌",
            error: "Failed to prepare transaction 🤯",
          },
        );

        await toast.promise(
          provider.send("eth_sendTransaction", [masterTransaction]),
          {
            pending: "Claiming master rewards...",
            success: "Master rewards claimed successfully 👌",
            error: "Failed to claim master rewards 🤯",
          },
        );
      }

      if (publicLicenses.length > 0) {
        const transaction = await toast.promise(
          getClaimRewardsTransaction(
            network,
            "license",
            account,
            publicLicenses,
          ),
          {
            pending: "Preparing license rewards transaction...",
            success: "Transaction prepared 👌",
            error: "Failed to prepare transaction 🤯",
          },
        );

        await toast.promise(
          provider.send("eth_sendTransaction", [transaction]),
          {
            pending: "Claiming license rewards...",
            success: "License rewards claimed successfully 👌",
            error: "Failed to claim license rewards 🤯",
          },
        );
      }

      await fetchRewards();
      confetti();
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setIsClaimingRewards(false);
    }
  };

  const buyLicense = async () => {
    if (!account || isBuyingLicense) return;

    setIsBuyingLicense(true);
    const toastId = toast.loading("Preparing transactions...");

    try {
      // Step 1: Approval Transaction
      const approvalTransaction = await approve(
        network,
        licensesAmount,
        account,
      );

      toast.update(toastId, {
        render: "Confirming approval transaction...",
        isLoading: true,
      });

      // Wait for approval transaction to complete
      const approvalReceipt = await provider.send("eth_sendTransaction", [
        approvalTransaction,
      ]);

      // Wait for one block confirmation
      await provider.waitForTransaction(approvalReceipt);

      toast.update(toastId, {
        render: "Approval confirmed. Preparing buy transaction...",
        isLoading: true,
      });

      // Step 2: Buy Transaction
      const buyTransaction = await getAddLicenseTransaction(
        network,
        "license",
        account,
        licensesAmount,
      );

      toast.update(toastId, {
        render: "Confirming buy transaction...",
        isLoading: true,
      });

      await provider.send("eth_sendTransaction", [buyTransaction]);

      toast.update(toastId, {
        render: "License purchased successfully! 👌",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      await getLicensesData();
      onBuyOpenChange();
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.update(toastId, {
        render: "Failed to complete transaction",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsBuyingLicense(false);
    }
  };

  const registerLicense = async () => {
    if (!selectedLicense || !account) return;

    try {
      const transaction = await toast.promise(
        getRegisterLicenseTransaction(
          network,
          selectedLicense.type,
          account,
          selectedLicense.id,
          nodeHash,
        ),
        {
          pending: "Preparing registration...",
          success: "Transaction prepared 👌",
          error: "Failed to prepare registration 🤯",
        },
      );

      await toast.promise(provider.send("eth_sendTransaction", [transaction]), {
        pending: "Registering license...",
        success: "License registered successfully 👌",
        error: "Registration failed 🤯",
      });

      await getLicensesData();
      onRegisterOpenChange();
    } catch (error) {
      console.error("Failed to register license:", error);
      toast.error("Failed to register license");
    }
  };


  const unRegisterLicense = async () => {
    if (!selectedLicense || !account) return;

    try {
      const transaction = await toast.promise(
        getUnRegisterLicenseTransaction(
          network,
          selectedLicense.type,
          account,
          selectedLicense.id,
          nodeHash,
        ),
        {
          pending: "Removing Node registration...",
          success: "Transaction prepared 👌",
          error: "Failed to remove node registration 🤯",
        },
      );

      await toast.promise(provider.send("eth_sendTransaction", [transaction]), {
        pending: "Removing license registration...",
        success: "Remove license registeration successfully 👌",
        error: "Remove license registration failed 🤯",
      });

      await getLicensesData();
      onUnRegisterOpenChange();
    } catch (error) {
      console.error("Failed to remove license registration:", error);
      toast.error("Failed to remove license registration");
    }
  };

  const renderCell = React.useCallback(
    (license: License, columnKey: React.Key) => {
      const cellValue = license[columnKey as keyof License];

      switch (columnKey) {
        case "id":
          return (
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

        case "estimateRewards":
          if (isLoadingRewards) {
            return (
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300" />
              </Skeleton>
            );
          }
          return (
            <div>
              {license.type === "master"
                ? masterRewards[license.id] || 0
                : licenseRewards[license.id] || 0}
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
                    isDisabled={isClaimingRewards}
                    onClick={() => claimRewards([license])}
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
                  <DropdownItem
                    isDisabled={isUnregister}
                    onClick={() => unRegisterLicense()}
                  >
                    Unregister Node
                  </DropdownItem>

                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [
      licenses,
      isLoadingRewards,
      isClaimingRewards,
      masterRewards,
      licenseRewards,
    ],
  );

  const hasClaimableRewards = licenses.some((license) => {
    const rewards =
      license.type === "master"
        ? masterRewards[license.id]
        : licenseRewards[license.id];
    return rewards > 0;
  });

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div />
          <div className="flex gap-3">
            <Button
              color="success"
              isDisabled={
                !licenses.length ||
                !hasClaimableRewards ||
                isLoadingRewards ||
                isClaimingRewards
              }
              onClick={() => {
                claimRewards(licenses).then(() => {
                  confetti();
                });
              }}
            >
              {isClaimingRewards ? "Claiming..." : "Claim Rewards"}
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
  }, [
    licenses.length,
    hasClaimableRewards,
    isLoadingRewards,
    isClaimingRewards,
  ]);

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
                    min="1"
                    placeholder="3"
                    type="number"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 5) {
                        setLicensesAmount(value);
                        handleLicensePrice(value);
                      } else if (e.target.value === "") {
                        // Handle empty input - reset to 1
                        setLicensesAmount(1);
                        handleLicensePrice(1);
                      }
                    }}
                    onBlur={(e) => {
                      // @ts-ignore
                      const value = parseInt(e.target.value);
                      if (value < 1) {
                        setLicensesAmount(1);
                        handleLicensePrice(1);
                      } else if (value > 5) {
                        setLicensesAmount(5);
                        handleLicensePrice(5);
                      }
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
                    <span>
                      Buy for {licensePrice}$ (
                      {calculateNaeuralAmount(licensePrice)} NAEURAL)
                    </span>
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
