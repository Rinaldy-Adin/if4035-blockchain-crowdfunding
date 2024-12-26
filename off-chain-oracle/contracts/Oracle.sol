// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ICaller.sol";

contract Oracle is AccessControl {
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");
    uint256 public constant REQUEST_TIMEOUT = 24 hours;
    uint256 public constant MIN_PROVIDERS = 1;

    uint256 private numProviders;
    uint256 private providersThreshold;

    struct VerificationRequest {
        address projectAddress;
        uint256 milestoneIndex;
        uint256 timestamp;
        uint256 approvalCount;
        uint256 rejectionCount;
        mapping(address => bool) hasProviderVoted;
        bool isActive;
        bool isFulfilled;
    }

    mapping(uint256 => VerificationRequest) private requests;

    event MilestoneVerificationRequested(
        address indexed callerAddress,
        uint256 requestId
    );
    event MilestoneVerificationReturned(
        bool verified,
        address indexed callerAddress,
        uint256 indexed requestId
    );
    event ProviderAdded(address indexed providerAddress);
    event ProviderRemoved(address indexed providerAddress);
    event ProvidersThresholdChanged(uint256 threshold);

    constructor(uint256 initialThreshold) {
        require(initialThreshold >= 1, "Threshold must be at least 1");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        providersThreshold = initialThreshold;
    }

    function requestMilestoneVerification(
        address projectAddress,
        uint256 milestoneIndex
    ) external returns (uint256) {
        require(numProviders >= MIN_PROVIDERS, "Insufficient providers");
        require(projectAddress != address(0), "Invalid project address");

        uint256 requestId = uint256(
            keccak256(
                abi.encodePacked(
                    projectAddress,
                    milestoneIndex,
                    block.timestamp,
                    msg.sender
                )
            )
        );

        VerificationRequest storage request = requests[requestId];
        require(!request.isActive, "Request ID collision");

        request.projectAddress = projectAddress;
        request.milestoneIndex = milestoneIndex;
        request.timestamp = block.timestamp;
        request.isActive = true;

        emit MilestoneVerificationRequested(
            msg.sender,
            requestId
        );

        return requestId;
    }

    function submitVerification(
        uint256 requestId,
        bool approved
    ) external onlyRole(PROVIDER_ROLE) {
        VerificationRequest storage request = requests[requestId];
        require(request.isActive, "Request not found or inactive");
        require(!request.isFulfilled, "Request already fulfilled");
        require(
            block.timestamp - request.timestamp <= REQUEST_TIMEOUT,
            "Request expired"
        );
        require(
            !request.hasProviderVoted[msg.sender],
            "Provider already voted"
        );

        request.hasProviderVoted[msg.sender] = true;

        if (approved) {
            request.approvalCount++;
        } else {
            request.rejectionCount++;
        }

        uint256 totalVotes = request.approvalCount + request.rejectionCount;
        if (totalVotes >= providersThreshold) {
            bool verified = request.approvalCount > request.rejectionCount;
            request.isFulfilled = true;
            request.isActive = false;
            ICaller caller = ICaller(request.projectAddress);
            caller.fulfillVerifyMilestoneRequest(verified, requestId);

            emit MilestoneVerificationReturned(
                verified,
                request.projectAddress,
                requestId
            );
        }
    }

    function addProvider(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(provider != address(0), "Invalid provider address");
        require(!hasRole(PROVIDER_ROLE, provider), "Provider already exists");

        _grantRole(PROVIDER_ROLE, provider);
        numProviders++;

        emit ProviderAdded(provider);
    }

    function removeProvider(
        address provider
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(PROVIDER_ROLE, provider), "Not a provider");
//        require(numProviders > MIN_PROVIDERS, "Cannot go below minimum providers");

        _revokeRole(PROVIDER_ROLE, provider);
        numProviders--;

        emit ProviderRemoved(provider);
    }

    function setProvidersThreshold(
        uint256 threshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(threshold > 0, "Threshold must be greater than 0");
        require(
            threshold <= numProviders,
            "Threshold cannot exceed number of providers"
        );

        providersThreshold = threshold;
        emit ProvidersThresholdChanged(threshold);
    }

    function isRegisteredOracle() external pure returns (bool) {
        return true;
    }

    function getProviderCount() external view returns (uint256) {
        return numProviders;
    }

    function getProvidersThreshold() external view returns (uint256) {
        return providersThreshold;
    }

    function getRequestStatus(
        uint256 requestId
    ) external view returns (
        bool isActive,
        bool isFulfilled,
        uint256 approvalCount,
        uint256 rejectionCount,
        uint256 timestamp
    ) {
        VerificationRequest storage request = requests[requestId];
        return (
            request.isActive,
            request.isFulfilled,
            request.approvalCount,
            request.rejectionCount,
            request.timestamp
        );
    }
}
