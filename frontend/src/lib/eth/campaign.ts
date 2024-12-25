import Web3 from 'web3';
import ProjectABI from '../../abi/Project.abi.json';
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
  const summary: string[] = await projectContract.methods
    .getProjectSummary()
    .call();
  return {
    name: summary[0] as string,
    imageCid: summary[1] as string,
    totalFunds: Number(summary[2]),
    totalGoals: parseFloat(web3.utils.fromWei(summary[3], 'ether')),
    backersCount: Number(summary[4]),
    milestonesCount: Number(summary[5]),
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
  const imageCid: string = await projectContract.methods.imageCid().call();
  const totalFunds: number = await projectContract.methods.totalFunds().call();

  const milestones: Milestone[] = await projectContract.methods
    .getMilestones()
    .call();
  // Format the data
  return {
    name,
    description,
    imageCid,
    totalFund: Number(totalFunds),
    milestones: milestones.map((milestone) => ({
      name: milestone.name,
      description: milestone.description,
      goal: parseFloat(web3.utils.fromWei(milestone.goal.toString(), 'ether')),
      achieved: milestone.achieved,
      verified: milestone.verified,
      withdrawn: milestone.withdrawn,
    })),
  };
}
