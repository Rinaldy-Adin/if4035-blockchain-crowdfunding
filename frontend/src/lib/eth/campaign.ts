import Web3, { EventLog } from 'web3';
import ProjectABI from '../../abi/Project.abi.json';
import { Milestone, Project, ProjectContributionItem, ProjectSummary } from '@/interfaces/project';
import dayjs from 'dayjs';

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

  const manager: string = await projectContract.methods.manager().call();
  // Format the data
  return {
    name,
    description,
    imageCid,
    totalFund: Number(totalFunds),
    manager,
    milestones: milestones.map((milestone) => ({
      name: milestone.name,
      description: milestone.description,
      goal: parseFloat(web3.utils.fromWei(milestone.goal.toString(), 'ether')),
      achieved: milestone.achieved,
      verified: milestone.verified,
      withdrawn: milestone.withdrawn,
      lastVerificationRequest: milestone.lastVerificationRequest,
    })),
  };
}

export async function verifyProjectMilestone(
  web3: Web3,
  address: string,
  milestoneIndex: number,
  accountAddress: string | null
) {
  if (!accountAddress) {
    throw new Error('No account address found');
  }

  const projectContract = getProjectContract(web3, address);
  const receipt = await projectContract.methods
    .verifyMilestone(milestoneIndex)
    .send({
      from: accountAddress,
      gas: '3000000',
    });

  console.log('Milestone Verification Requested');
  console.log('Transaction Receipt:', receipt);
}

export async function getProjectContributions(
  web3: Web3,
  projectAddress: string,
): Promise<ProjectContributionItem[]> {
  const projectContract = getProjectContract(web3, projectAddress);

  // "allEvents" typecast done to ignore error as .getPastEvents has outdated typescript definition
  const events = (await projectContract.getPastEvents("ContributionMade" as "allEvents", {
    fromBlock: 0,
    toBlock: "latest",
  })) as EventLog[];

  return events.map((event) => ({
    backerAddress: event.returnValues.backer as string,
    amount: web3.utils.fromWei((event.returnValues.amount as bigint).toString(), "ether"),
    timestamp: dayjs.unix(Number(event.returnValues.timestamp)).toDate(),
  }));
}
