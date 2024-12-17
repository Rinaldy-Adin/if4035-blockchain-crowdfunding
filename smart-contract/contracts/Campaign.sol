// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// masih purely chatgpt
// TODO: memahami
// TODO: adjust milestone logic

contract Campaign {
    address public manager;
    string public name;
    string public description;
    uint256 public totalFunds;

    struct Milestone {
        string name;
        string description;
        uint256 goal;

        uint256 achieved;
        bool verified;
        bool withdrawn;
    }

    Milestone[] public milestones;
    mapping(address => uint256) public contributions;
    address[] public backers;

    event ContributionMade(address indexed backer, uint256 amount);
    event MilestoneUpdated(uint256 milestoneIndex, uint256 achievedAmount);
    event MilestoneVerified(uint256 milestoneIndex, string milestoneName);

    modifier restricted() {
        require(msg.sender == manager, "Only the manager can perform this action");
        _;
    }

    constructor(
        address creator,
        string memory _name,
        string memory _description,
        Milestone[] calldata campaignMilestones
    ) {
        require(campaignMilestones.length > 0, "At least one milestone is required");

        manager = creator;
        name = _name;
        description = _description;

        for (uint256 i = 0; i < campaignMilestones.length; i++) {
            milestones.push(Milestone({
                name: campaignMilestones[i].name,
                description: campaignMilestones[i].description,
                goal: campaignMilestones[i].goal,

                achieved: 0,
                verified: false,
                withdrawn: false,
            }));
        }
    }

    function contribute() public payable {
        require(msg.value > 0, "Contribution must be greater than 0");

        if (contributions[msg.sender] == 0) {
            backers.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;

        uint256 remainingContribution = msg.value;

        for (uint256 i = 0; i < milestones.length && remainingContribution > 0; i++) {
            Milestone storage milestone = milestones[i];

            if (milestone.achieved < milestone.goal) {
                uint256 remainingGoal = milestone.goal - milestone.achieved;

                if (remainingContribution <= remainingGoal) {
                    milestone.achieved += remainingContribution;
                    remainingContribution = 0;
                } else {
                    milestone.achieved += remainingGoal;
                    remainingContribution -= remainingGoal;
                }

                emit MilestoneUpdated(i, milestone.achieved);
            }
        }

        emit ContributionMade(msg.sender, msg.value);
    }

    // TODO: fix so withdraw can be done per milestone
    function withdrawFunds(uint256 index) public restricted {
        require(index < milestones.length, "Invalid milestone index");
        Milestone storage milestone = milestones[index];
        require(milestone.verified, "Milestone not yet verified");
        require(!milestone.withdrawn, "Milestone already withdrawn");
        require(milestone.achieved >= milestone.goal, "Milestone goal has not been met");

        uint256 amount = milestone.goal;
        require(address(this).balance >= amount, "Insufficient contract balance");

        milestone.withdrawn = true;
        payable(manager).transfer(amount);

        emit FundsWithdrawn(amount, manager);
    }

    function getCampaignSummary() public view returns (
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        return (
            manager,
            goal,
            totalFunds,
            address(this).balance,
            backers.length,
            milestones.length
        );
    }

    function getMilestones() public view returns (Milestone[] memory) {
        return milestones;
    }

    // TODO: adjust to use oracle @rachel
    function verifyMilestone(uint256 index) public restricted {
        require(index < milestones.length, "Invalid milestone index");
        Milestone storage milestone = milestones[index];
        require(!milestone.verified, "Milestone already verified");
        require(!milestone.withdrawn, "Milestone already withdrawn");
        require(milestone.achieved >= milestone.goal, "Milestone goal has not been met");

        milestone.verified = true;

        emit MilestoneVerified(index, milestone.name);
    }
}