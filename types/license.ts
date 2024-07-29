export interface License {
  id: string;
  type: string;
  nodeHash: string;
  estimateRewards: number;
  lastClaimCycle: string;
  lastClaimCycleReadable: string;
  currentClaimAmount: string;
  remainingClaimAmount: string;
  currentClaimableCycles: string | undefined;
  nodePower: string | undefined;
}
