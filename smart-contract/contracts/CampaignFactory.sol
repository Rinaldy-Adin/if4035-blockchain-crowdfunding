// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// masih purely chatgpt
// TODO: memahami

import "./Campaign.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;

    event CampaignCreated(address campaignAddress, address creator, uint256 goal);

    function createCampaign(uint256 goal) public {
        Campaign newCampaign = new Campaign(msg.sender, goal);
        deployedCampaigns.push(address(newCampaign));

        emit CampaignCreated(address(newCampaign), msg.sender, goal);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}
