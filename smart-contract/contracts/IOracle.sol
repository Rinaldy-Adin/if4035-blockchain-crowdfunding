// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IOracle {
    function requestMilestoneVerification(
        address projectAddress,
        uint256 milestoneIndex
    ) external returns (uint256);
}
