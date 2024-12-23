export interface Milestone {
  name: string;
  description: string;
  target: number;
}

export interface Project {
  name: string;
  description: string;
  milestones: Milestone[];
  totalFund: number;
}

export type ProjectSummary = {
  projectAddress: string;
  name: string;
  totalFunds: number;
  totalGoals: number;
  backersCount: number;
  milestonesCount: number;
};

