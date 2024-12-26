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
