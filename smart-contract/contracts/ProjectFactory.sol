// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Project} from "./Project.sol";
import "hardhat/console.sol";

contract ProjectFactory {
    address[] public deployedProjects;

    event ProjectCreated(address campaignAddress, address creator, string name, string description);
    event ContributionMade(address indexed project, string projectName, uint256 timestamp, address indexed backer, uint256 amount);

    function createProject(
        string memory _name,
        string memory _description,
        string memory _imageCid,
        string[] memory milestoneNames,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneGoals
    ) public {
        console.log("createProject");
        require(
            milestoneNames.length > 0 &&
            milestoneNames.length == milestoneDescriptions.length &&
            milestoneNames.length == milestoneGoals.length,
            "Invalid milestones input"
        );

        Project newProject = new Project(msg.sender, _name, _description, _imageCid, milestoneNames, milestoneDescriptions, milestoneGoals, address(this));
        deployedProjects.push(address(newProject));

        console.log("Project created 123");
        emit ProjectCreated(address(newProject), msg.sender, _name, _description);
    }

    function getDeployedProjects() public view returns (address[] memory) {
        return deployedProjects;
    }

    function contributeToProject(address projectAddress) public payable {
        require(msg.value > 0, "Contribution must be greater than 0");

        Project project = Project(projectAddress);
        project.receiveContribution{value: msg.value}(msg.sender);

        string memory projectName = project.name();

        emit ContributionMade(projectAddress, projectName, block.timestamp, msg.sender, msg.value);
    }
}
