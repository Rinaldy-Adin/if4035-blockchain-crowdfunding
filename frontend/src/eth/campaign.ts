import Web3 from 'web3';
import ProjectABI from '../abi/Project.abi.json';
import { Milestone, Project, ProjectSummary } from '@/interfaces/project';

export function getProjectContract(web3: Web3, address: string) {
  try {
    return new web3.eth.Contract(ProjectABI, address);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    throw error;
  }
}

export async function getProjectSummary(
  web3: Web3,
  address: string
): Promise<ProjectSummary> {
  const projectContract = getProjectContract(web3, address);
  const summary = await projectContract.methods.getProjectSummary().call();
  return {
    name: summary[0] as string,
    totalFunds: Number(summary[1]),
    totalGoals: Number(summary[2]),
    backersCount: Number(summary[3]),
    milestonesCount: Number(summary[4]),
    projectAddress: address,
  };
}

export async function getProjectDetail(
  web3: Web3,
  address: string
): Promise<Project> {
  const projectContract = getProjectContract(web3, address);
  const name: string = await projectContract.methods.name().call();
  const description: string = await projectContract.methods
    .description()
    .call();
  const totalFunds: number = await projectContract.methods.totalFunds().call();

  const milestones: Milestone[] = await projectContract.methods
    .getMilestones()
    .call();

  // Format the data
  return {
    name,
    description,
    totalFund: Number(totalFunds),
    milestones: milestones.map((milestone) => ({
      name: milestone.name,
      description: milestone.description,
      goal: Number(milestone.goal),
      achieved: milestone.achieved,
      verified: milestone.verified,
      withdrawn: milestone.withdrawn,
    })),
  };
}
