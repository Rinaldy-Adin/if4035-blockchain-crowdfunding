// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;

    event CampaignCreated(address campaignAddress, address creator, string name, string description);

    function createCampaign(
        string memory _name,
        string memory _description,
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

        Campaign newCampaign = new Campaign(msg.sender, _name, _description, milestoneNames, milestoneDescriptions, milestoneGoals);
        deployedCampaigns.push(address(newCampaign));

        emit CampaignCreated(address(newCampaign), msg.sender, _name, _description);
    }
    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}
