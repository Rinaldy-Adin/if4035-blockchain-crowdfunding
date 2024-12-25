export interface Milestone {
  name: string;
  description: string;
  goal: number;
  achieved: number;
  verified: boolean;
  withdrawn: boolean;
}

export interface Project {
  name: string;
  description: string;
  imageCid: string;
  milestones: Milestone[];
  totalFund: number;
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
