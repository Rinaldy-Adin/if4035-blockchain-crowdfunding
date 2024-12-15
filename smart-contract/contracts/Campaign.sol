// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// masih purely chatgpt
// TODO: memahami
// TODO: adjust milestone logic

contract Campaign {
    address public manager;
    uint256 public goal;
    uint256 public totalFunds;

    struct Milestone {
        string name;
        string description;
        uint256 goal;
        bool achieved;
    }

    Milestone[] public milestones;
    mapping(address => uint256) public contributions;
    address[] public backers;

    event ContributionMade(address indexed backer, uint256 amount);
    event FundsWithdrawn(uint256 amount, address recipient);
    event MilestoneAdded(uint256 milestoneIndex, string name, string description, uint256 goal);
    event MilestoneAchieved(uint256 milestoneIndex, string name);

    modifier restricted() {
        require(msg.sender == manager, "Only the manager can perform this action");
        _;
    }

    constructor(address creator, uint256 campaignGoal) {
        manager = creator;
        goal = campaignGoal;
    }

    function contribute() public payable {
        require(msg.value > 0, "Contribution must be greater than 0");

        if (contributions[msg.sender] == 0) {
            backers.push(msg.sender);
        }

        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;

        emit ContributionMade(msg.sender, msg.value);
    }

    // TODO: fix so withdraw can be done per balance
    function withdrawFunds() public restricted {
        require(totalFunds >= goal, "Funding goal has not been met");
        uint256 amount = address(this).balance;
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

    // TODO: add milestone logic to constructor 
    function addMilestone(string memory name, string memory description, uint256 milestoneGoal) public restricted {
        require(milestoneGoal > 0, "Milestone goal must be greater than 0");

        milestones.push(Milestone({
            name: name,
            description: description,
            goal: milestoneGoal,
            achieved: false
        }));

        emit MilestoneAdded(milestones.length - 1, name, description, milestoneGoal);
    }

    // TODO: adjust to use oracle @rachel
    function achieveMilestone(uint256 index) public restricted {
        require(index < milestones.length, "Invalid milestone index");
        Milestone storage milestone = milestones[index];
        require(!milestone.achieved, "Milestone already achieved");
        require(totalFunds >= milestone.goal, "Milestone goal has not been met");

        milestone.achieved = true;

        emit MilestoneAchieved(index, milestone.name);
    }

    function getMilestones() public view returns (Milestone[] memory) {
        return milestones;
    }
}
