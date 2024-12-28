import Web3 from 'web3';
import ProjectKickstarterApp from '../../abi/ProjectFactory.abi.json';
import { ProjectSummary } from '@/interfaces/project';
import { getProjectSummary } from '@/lib/eth/campaign.ts';

const FACTORY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

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

    const projectSummaries: ProjectSummary[] = await Promise.all(
      projectAddresses.map(async (address): Promise<ProjectSummary> => {
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
