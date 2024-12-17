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