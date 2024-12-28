export interface Milestone {
  name: string;
  description: string;
  goal: number;
  achieved: number;
  verified: boolean;
  withdrawn: boolean;
  lastVerificationRequest: bigint; // time
}

export interface Project {
  name: string;
  description: string;
  imageCid: string;
  milestones: Milestone[];
  totalFund: number;
  manager: string;
}

export type ProjectSummary = {
  projectAddress: string;
  name: string;
  imageCid: string;
  totalFunds: number;
  totalGoals: number;
  backersCount: number;
  milestonesCount: number;
};

export type ContributionHistoryItem = {
  projectAddress: string;
  projectName: string;
  timestamp: Date;
  backerAddress: string;
  amount: string;
};

export type ProjectContributionItem = {
  backerAddress: string;
  amount: string;
  timestamp: Date;
};
