// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Project} from "./Project.sol";
import "hardhat/console.sol";

contract ProjectFactory {
    address[] public deployedProjects;

    event ProjectCreated(address campaignAddress, address creator, string name, string description);

    function createProject(
        string memory _name,
        string memory _description,
        string memory _imageCid,
        string[] memory milestoneNames,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneGoals
    ) public {
        require(
            milestoneNames.length > 0 &&
            milestoneNames.length == milestoneDescriptions.length &&
            milestoneNames.length == milestoneGoals.length,
            "Invalid milestones input"
        );

        Project newProject = new Project(msg.sender, _name, _description, _imageCid, milestoneNames, milestoneDescriptions, milestoneGoals);
        deployedProjects.push(address(newProject));

        emit ProjectCreated(address(newProject), msg.sender, _name, _description);
    }

    function getDeployedProjects() public view returns (address[] memory) {
        return deployedProjects;
    }
}
