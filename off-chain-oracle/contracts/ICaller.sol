// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ICaller {
    function fulfillVerifyMilestoneRequest(bool verified, uint256 id) external;
}
