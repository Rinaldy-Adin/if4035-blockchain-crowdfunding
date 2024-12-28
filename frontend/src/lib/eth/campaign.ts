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
    totalFunds: parseFloat(web3.utils.fromWei(summary[2], 'ether')),
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
      achieved: parseFloat(
        web3.utils.fromWei(milestone.achieved.toString(), 'ether')
      ),
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

export async function contributeToProject(
  web3: Web3,
  address: string,
  contributionAmount: string,
  accountAddress: string | null
) {
  if (!accountAddress) {
    throw new Error('No account address found');
  }

  const projectContract = getProjectContract(web3, address);
  const amountInWei = web3.utils.toWei(contributionAmount, 'ether');

  const receipt = await projectContract.methods.contribute().send({
    from: accountAddress,
    value: amountInWei,
    gas: '3000000',
  });

  console.log('Contribution Made');
  console.log('Transaction Receipt:', receipt);
}

export async function withdrawFundsFromProject(
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
    .withdrawFunds(milestoneIndex)
    .send({
      from: accountAddress,
      gas: '3000000',
    });

  console.log('Milestone Withdrawn');
  console.log('Transaction Receipt:', receipt);
}
