import { ethers } from "hardhat";
import { expect } from "chai";

describe("ProjectFactory", function () {
  let projectFactory: any;
  let owner: any;

  beforeEach(async function () {
    const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
    [owner] = await ethers.getSigners();

    // Deploy a new ProjectFactory contract before each test
    projectFactory = await ProjectFactory.deploy(
      "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"
    );
  });

  it("should create a new project and emit an event", async function () {
    const projectName = "Test Project";
    const projectDescription = "A description for a test project.";
    const milestoneNames = ["Milestone 1"];
    const milestoneDescriptions = ["Description for Milestone 1"];
    const milestoneGoals = [1000];

    const createProjectTx = await projectFactory.createProject(
      projectName,
      projectDescription,
      "",
      milestoneNames,
      milestoneDescriptions,
      milestoneGoals
    );

    // Wait for the transaction to be mined
    await expect(createProjectTx)
      .to.emit(projectFactory, "ProjectCreated")
      .withArgs(
        await projectFactory.deployedProjects(0), // Access the first deployed project address
        owner.address, // Verify the transaction sender's address
        projectName,
        projectDescription
      );

    const deployedProjects = await projectFactory.getDeployedProjects();
    expect(deployedProjects.length).to.equal(1);
    const project = await ethers.getContractAt("Project", deployedProjects[0]);
    await project.verifyMilestone(0);
  });
});
