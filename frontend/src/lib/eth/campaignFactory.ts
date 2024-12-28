import Web3, { EventLog } from 'web3';
import ProjectKickstarterApp from '../../abi/ProjectFactory.abi.json';
import { ProjectSummary } from '@/interfaces/project';
import { getProjectSummary } from '@/lib/eth/campaign.ts';

export const FACTORY_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

export function getProjectFactoryContract(web3: Web3) {
  try {
    return new web3.eth.Contract(ProjectKickstarterApp, FACTORY_ADDRESS);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    throw error;
  }
}

export async function createProject(
  web3: Web3,
  fromAddress: string,
  projectName: string,
  projectDescription: string,
  projectImageCid: string,
  milestoneNames: string[],
  milestoneDescriptions: string[],
  milestoneGoals: string[]
): Promise<void> {
  try {
    const projectFactory = getProjectFactoryContract(web3);
    const receipt = await projectFactory.methods
      .createProject(
        projectName,
        projectDescription,
        projectImageCid,
        milestoneNames,
        milestoneDescriptions,
        milestoneGoals
      )
      .send({
        from: fromAddress,
        gas: '3000000',
      });

    console.log('Project created successfully!');
    console.log('Transaction Receipt:', receipt);
  } catch (error) {
    console.error('Error creating project:', error);
  }
}

export async function getDeployedProjects(
  web3: Web3
): Promise<ProjectSummary[]> {
  try {
    const projectFactory = getProjectFactoryContract(web3);
    const projectAddresses: string[] = await projectFactory.methods
      .getDeployedProjects()
      .call();
    console.log('Project Addresses:', projectAddresses);

    const projectSummaries: ProjectSummary[] = await Promise.all(
      projectAddresses.map(async (address): Promise<ProjectSummary> => {
        console.log(web3.eth);
        return getProjectSummary(web3, address);
      })
    );

    console.log('Projects Summaries:', projectSummaries);
    return projectSummaries;
  } catch (error) {
    console.error('Error fetching deployed projects:', error);
    throw error;
  }
}

export async function contributeToProject(
  web3: Web3,
  projectAddress: string,
  contributionAmount: string,
  accountAddress: string | null
) {
  if (!accountAddress) {
    throw new Error('No account address found');
  }

  if (!projectAddress) {
    throw new Error('No project address found');
  }

  const factoryContract = getProjectFactoryContract(web3);
  const amountInWei = web3.utils.toWei(contributionAmount, 'ether');

  const receipt = await factoryContract.methods
    .contributeToProject(projectAddress)
    .send({
      from: accountAddress,
      value: amountInWei,
      gas: '3000000',
    });

  console.log('Contribution Made');
  console.log('Transaction Receipt:', receipt);
}

export async function getUserContributions(
  web3: Web3,
  userAddress: string
) {
  const factoryContract = getProjectFactoryContract(web3);

  // "allEvents" typecast done to ignore error as .getPastEvents has outdated typescript definition
  const events = (await factoryContract.getPastEvents("ContributionMade" as "allEvents", {
    filter: { backer: userAddress },
    fromBlock: 0,
    toBlock: "latest",
  })) as EventLog[];

  console.log(events);

  return events.map((event) => ({
    project: event.returnValues.project,
    backer: event.returnValues.backer,
    amount: web3.utils.fromWei(event.returnValues.amount as number, "ether"),
    transactionHash: event.transactionHash,
  }));
}
