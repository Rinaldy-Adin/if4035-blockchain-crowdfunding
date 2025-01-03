// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./IOracle.sol";
import "hardhat/console.sol";

contract Project {
    address public manager;
    string public name;
    string public description;
    string public imageCid;
    uint256 public totalFunds;
    uint256 public totalGoal;

    struct Milestone {
        string name;
        string description;
        uint256 goal;

        uint256 achieved;
        bool verified;
        bool withdrawn;
        uint256 lastVerificationRequest;
        uint256 verificationRequestId;
    }

    Milestone[] public milestones;
    mapping(address => uint256) public contributions;
    mapping(uint256 => uint256) public requestToMilestone;
    address[] public backers;

    address public oracleAddress;
    address public factoryAddress;

    event ContributionMade(address indexed backer, uint256 amount, uint256 timestamp);
    event MilestoneUpdated(uint256 milestoneIndex, uint256 achievedAmount);
    event MilestoneVerificationChanged(uint256 milestoneIndex, bool verified);
    event FundsWithdrawn(address manager, uint256 amount);

    modifier restricted() {
        require(msg.sender == manager, "Only the manager can perform this action");
        _;
    }

    constructor(
        address creator,
        string memory _name,
        string memory _description,
        string memory _imageCid,
        string[] memory milestoneNames,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneGoals,
        address _factoryAddress,
        address _oracleAddress
    ) {
        require(
            milestoneNames.length > 0 &&
            milestoneNames.length == milestoneDescriptions.length &&
            milestoneNames.length == milestoneGoals.length,
            "Invalid milestones input"
        );

        totalGoal = 0;
        for (uint256 i = 0; i < milestoneNames.length; i++) {
            require(milestoneGoals[i] > 0, "Milestone goals must be greater than 0");
            totalGoal += milestoneGoals[i];
        }

        manager = creator;
        name = _name;
        description = _description;
        imageCid = _imageCid;
        factoryAddress = _factoryAddress;
        oracleAddress = _oracleAddress;

        for (uint256 i = 0; i < milestoneNames.length; i++) {
            milestones.push(Milestone({
                name: milestoneNames[i],
                description: milestoneDescriptions[i],
                goal: milestoneGoals[i],

                achieved: 0,
                verified: false,
                withdrawn: false,
                lastVerificationRequest: 0,
                verificationRequestId: 0
            }));
        }
    }

    function receiveContribution(address contributor) external payable {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(msg.value + totalFunds <= totalGoal, "Contribution must not exceed project goal");
        require(msg.sender == factoryAddress, "Only the factory can forward contributions");

        if (contributions[contributor] == 0) {
            backers.push(contributor);
        }
        contributions[contributor] += msg.value;
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

        emit ContributionMade(contributor, msg.value, block.timestamp);
    }

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

        emit FundsWithdrawn(manager, amount);
    }

    function verifyMilestone(uint256 index) public restricted {
        require(index < milestones.length, "Invalid milestone index");
        Milestone storage milestone = milestones[index];
        require(index == 0 || milestones[index - 1].verified, "Previous milestone not verified");
        require(!milestone.verified, "Milestone already verified");
        require(!milestone.withdrawn, "Milestone already withdrawn");

        // Prevent spam requests
        require(
            milestone.lastVerificationRequest == 0 ||
            block.timestamp > milestone.lastVerificationRequest + 24 hours,
            "Too soon to request verification again"
        );

        IOracle oracle = IOracle(oracleAddress);
        uint256 requestId = oracle.requestMilestoneVerification(address(this), index);
        requestToMilestone[requestId] = index;
        milestone.verificationRequestId = requestId;
        milestone.lastVerificationRequest = block.timestamp;
    }

    function fulfillVerifyMilestoneRequest(bool verified, uint256 requestId) public {
        uint256 milestoneIndex = requestToMilestone[requestId];
        require(milestoneIndex < milestones.length, "Invalid milestone index");

        Milestone storage milestone = milestones[milestoneIndex];
        require(milestone.verificationRequestId == requestId, "Invalid request ID");
        require(!milestone.verified, "Milestone already verified");

        require(msg.sender == oracleAddress, "Caller is not the registered oracle");

        milestone.verified = verified;
        delete requestToMilestone[requestId];

        emit MilestoneVerificationChanged(milestoneIndex, verified);
    }

    function getProjectSummary() public view returns (
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        uint256,
        address
    ) {
        uint256 totalGoals = 0;
        for (uint256 j = 0; j < milestones.length; j++) {
            totalGoals += milestones[j].goal;
        }

        return (
            name,
            imageCid,
            totalFunds,
            totalGoals,
            backers.length,
            milestones.length,
            manager
        );
    }

    function getMilestones() public view returns (Milestone[] memory) {
        return milestones;
    }
}
