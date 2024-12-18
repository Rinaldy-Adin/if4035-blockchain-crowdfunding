import Web3 from 'web3';
import ProjectKickstarterApp from '../abi/ProjectFactory.abi.json';

const FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export function getProjectFactoryContract(web3: Web3) {
  return new web3.eth.Contract(ProjectKickstarterApp.abi, FACTORY_ADDRESS);
}

export async function createProject(
  web3: Web3,
  fromAddress: string,
  projectName: string,
  projectDescription: string,
  milestoneNames: string[],
  milestoneDescriptions: string[],
  milestoneGoals: string[]
): Promise<void> {
  try {
    const projectFactory = getProjectFactoryContract(web3);

    console.log({ fromAddress, milestoneGoals });
    const receipt = await projectFactory.methods
      .createProject(
        projectName,
        projectDescription,
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

export async function getDeployedProjects(web3: Web3): Promise<string[]> {
  try {
    const projectFactory = getProjectFactoryContract(web3);

    const projects: string[] = await projectFactory.methods
      .getDeployedProjects()
      .call();

    console.log('Deployed Project Addresses:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching deployed projects:', error);
    throw error;
  }
}
