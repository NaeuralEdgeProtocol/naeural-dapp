import { License } from "@/types/license";

export const getLicensePrice = async (
  network: string,
  contractType: string,
): Promise<any> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/licenses/price/${network}/${contractType}`,
  );

  return await response.json();
};

export const getAccountData = async (
  network: string,
  address: string,
): Promise<any> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/accounts/${network}/?address=${address}`,
  );

  return await response.json();
};

export const getLicenses = async (
  network: string,
  contractType: string,
  address: string,
): Promise<any> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/licenses/list/${network}/${contractType}/?address=${address}`,
  );

  return await response.json();
};

export const getClaimRewardsTransaction = async (
  network: string,
  contractType: string,
  address: string,
  licenseList: License[],
): Promise<any> => {
  const queryParams = new URLSearchParams();

  queryParams.append("address", address);

  licenseList.forEach((license, index) => {
    queryParams.append(`licenses[${index}]`, JSON.stringify(license));
  });

  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/rewards/claim/${network}/${contractType}/?${queryParams.toString()}`,
  );

  return await response.json();
};

export const getAddLicenseTransaction = async (
  network: string,
  contractType: string,
  address: string,
  amount: number,
): Promise<any> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/licenses/create/${network}/${contractType}?address=${address}&amount=${amount}`,
  );

  return await response.json();
};

export const approve = async (
  network: string,
  amount: number,
  address: string,
): Promise<any> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/accounts/${network}/approve/${amount}?address=${address}`,
  );

  return await response.json();
};

export const getRegisterLicenseTransaction = async (
  network: string,
  contractType: string,
  address: string,
  licenseId: string,
  nodeHash: string,
): Promise<any> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/licenses/register/${network}/${contractType}/?address=${address}&licenseId=${licenseId}&nodeHash=${nodeHash}`,
  );

  return await response.json();
};

export const getUnRegisterLicenseTransaction = async (
  network: string,
  contractType: string,
  address: string,
  licenseId: string,
  nodeHash: string,
): Promise<any> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/licenses/unregister/${network}/${contractType}/?address=${address}&licenseId=${licenseId}&nodeHash=${nodeHash}`,
  );

  return await response.json();
};

export const getEstimateRewards = async (
  network: string,
  contractType: string,
  address: string,
  licenseList: License[],
): Promise<any> => {
  const queryParams = new URLSearchParams();

  queryParams.append("address", address);
  licenseList.forEach((license, index) => {
    queryParams.append(`licenses[${index}]`, JSON.stringify(license));
  });

  const response = await fetch(
    process.env.NEXT_PUBLIC_GATEWAY_URL +
    `/rewards/estimate/${network}/${contractType}/?${queryParams.toString()}`,
  );

  return await response.json();
};
