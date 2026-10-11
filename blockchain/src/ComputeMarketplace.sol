// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./ProviderRegistry.sol";

contract ComputeMarketplace is Ownable, ReentrancyGuard {
    IERC20 public immutable paymentToken;
    ProviderRegistry public immutable providerRegistry;

    uint256 public nextJobId;

    uint256 public constant PLATFORM_FEE = 5;
    uint256 public constant MAX_SUBJOBS = 5;

    enum JobStatus {
        OPEN,
        IN_PROGRESS,
        COMPLETED,
        VERIFIED,
        DISPUTED,
        SETTLED,
        CANCELLED
    }

    enum SubJobStatus {
        OPEN,
        ACCEPTED,
        COMPLETED,
        VERIFIED,
        DISPUTED,
        SETTLED,
        CANCELLED
    }

    struct Job {
        uint256 jobId;
        address requester;
        string datasetCID;
        uint256 totalChunks;
        uint256 reward;
        uint256 deadline;
        uint256 completedChunks;
        uint256 settledChunks;
        JobStatus status;
    }

    struct SubJob {
        uint256 subJobId;
        uint256 jobId;
        uint256 chunkIndex;
        address provider;
        uint256 reward;
        bytes32 inputHash;
        bytes32 expectedOutputHash;
        bytes32 outputHash;
        SubJobStatus status;
    }

    mapping(uint256 => Job) public jobs;

    mapping(uint256 => mapping(uint256 => SubJob)) public subJobs;

    mapping(uint256 => uint256) public subJobCount;

    event JobCreated(
        uint256 indexed jobId,
        address indexed requester,
        uint256 reward,
        uint256 totalChunks
    );

    event SubJobCreated(
        uint256 indexed jobId,
        uint256 indexed subJobId,
        uint256 chunkIndex,
        uint256 reward
    );

    event SubJobAccepted(
        uint256 indexed jobId,
        uint256 indexed subJobId,
        address indexed provider
    );

    event ResultSubmitted(
        uint256 indexed jobId,
        uint256 indexed subJobId,
        bytes32 outputHash
    );

    event SubJobVerified(
        uint256 indexed jobId,
        uint256 indexed subJobId
    );

    event SubJobSettled(
        uint256 indexed jobId,
        uint256 indexed subJobId,
        address indexed provider,
        uint256 amount
    );

    event JobSettled(uint256 indexed jobId);

    event JobCancelled(uint256 indexed jobId);

    event JobDisputed(
        uint256 indexed jobId,
        uint256 indexed subJobId,
        bytes32 evidenceHash
    );

    event DisputeResolved(
        uint256 indexed jobId,
        uint256 indexed subJobId,
        bool providerWon
    );

    constructor(
        address _paymentToken,
        address _providerRegistry
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        providerRegistry = ProviderRegistry(_providerRegistry);
    }

    // ============================================================
    // CREATE MAIN JOB
    // ============================================================

    function createJob(
        string calldata datasetCID,
        uint256 reward,
        uint256 deadline,
        bytes32[5] calldata inputHashes,
        bytes32[5] calldata expectedOutputHashes
    ) external {
        require(reward > 0, "Invalid reward");
        require(deadline > block.timestamp, "Invalid deadline");

        paymentToken.transferFrom(
            msg.sender,
            address(this),
            reward
        );

        uint256 jobId = nextJobId;

        jobs[jobId] = Job({
            jobId: jobId,
            requester: msg.sender,
            datasetCID: datasetCID,
            totalChunks: MAX_SUBJOBS,
            reward: reward,
            deadline: deadline,
            completedChunks: 0,
            settledChunks: 0,
            status: JobStatus.OPEN
        });

        uint256 rewardPerChunk = reward / MAX_SUBJOBS;

        require(
            rewardPerChunk > 0,
            "Reward too small"
        );

        for (uint256 i = 0; i < MAX_SUBJOBS; i++) {
            subJobs[jobId][i] = SubJob({
                subJobId: i,
                jobId: jobId,
                chunkIndex: i,
                provider: address(0),
                reward: rewardPerChunk,
                inputHash: inputHashes[i],
                expectedOutputHash: expectedOutputHashes[i],
                outputHash: bytes32(0),
                status: SubJobStatus.OPEN
            });

            emit SubJobCreated(
                jobId,
                i,
                i,
                rewardPerChunk
            );
        }

        subJobCount[jobId] = MAX_SUBJOBS;

        emit JobCreated(
            jobId,
            msg.sender,
            reward,
            MAX_SUBJOBS
        );

        nextJobId++;
    }

    // ============================================================
    // ACCEPT SUBJOB
    // ============================================================

    function acceptSubJob(
        uint256 jobId,
        uint256 subJobId
    ) external {
        Job storage job = jobs[jobId];
        SubJob storage subJob = subJobs[jobId][subJobId];

        require(
            providerRegistry.isProvider(msg.sender),
            "Not registered provider"
        );

        require(
            providerRegistry.hasEnoughStake(
                msg.sender,
                subJob.reward
            ),
            "Insufficient stake"
        );

        require(
            providerRegistry.getStake(msg.sender) > 0,
            "No stake"
        );

        require(
            job.status == JobStatus.OPEN ||
            job.status == JobStatus.IN_PROGRESS,
            "Job not available"
        );

        require(
            subJob.status == SubJobStatus.OPEN,
            "SubJob not open"
        );

        require(
            block.timestamp < job.deadline,
            "Job expired"
        );

        subJob.provider = msg.sender;
        subJob.status = SubJobStatus.ACCEPTED;

        job.status = JobStatus.IN_PROGRESS;

        providerRegistry.increaseActiveJobs(msg.sender);

        emit SubJobAccepted(
            jobId,
            subJobId,
            msg.sender
        );
    }

    // ============================================================
    // SUBMIT RESULT
    // ============================================================

    function submitSubJobResult(
        uint256 jobId,
        uint256 subJobId,
        bytes32 outputHash
    ) external {
        SubJob storage subJob = subJobs[jobId][subJobId];

        require(
            subJob.status == SubJobStatus.ACCEPTED,
            "Invalid status"
        );

        require(
            msg.sender == subJob.provider,
            "Not provider"
        );

        subJob.outputHash = outputHash;
        subJob.status = SubJobStatus.COMPLETED;

        jobs[jobId].completedChunks++;

        emit ResultSubmitted(
            jobId,
            subJobId,
            outputHash
        );
    }

    // ============================================================
    // VERIFY SUBJOB
    // ============================================================

    function verifySubJob(
        uint256 jobId,
        uint256 subJobId
    ) external onlyOwner {
        Job storage job = jobs[jobId];
        SubJob storage subJob = subJobs[jobId][subJobId];

        require(
            subJob.status == SubJobStatus.COMPLETED,
            "Not completed"
        );

        require(
            subJob.outputHash == subJob.expectedOutputHash,
            "Invalid result"
        );

        subJob.status = SubJobStatus.VERIFIED;

        emit SubJobVerified(
            jobId,
            subJobId
        );

        if (
            job.completedChunks == job.totalChunks
        ) {
            job.status = JobStatus.VERIFIED;
        }
    }

    // ============================================================
    // SETTLE SUBJOB
    // ============================================================

    function settleSubJob(
        uint256 jobId,
        uint256 subJobId
    ) external nonReentrant {
        Job storage job = jobs[jobId];
        SubJob storage subJob = subJobs[jobId][subJobId];

        require(
            subJob.status == SubJobStatus.VERIFIED,
            "Not verified"
        );

        uint256 fee =
            (subJob.reward * PLATFORM_FEE) / 100;

        uint256 providerAmount =
            subJob.reward - fee;

        paymentToken.transfer(
            subJob.provider,
            providerAmount
        );

        paymentToken.transfer(
            owner(),
            fee
        );

        subJob.status = SubJobStatus.SETTLED;

        job.settledChunks++;

        providerRegistry.decreaseActiveJobs(
            subJob.provider
        );

        emit SubJobSettled(
            jobId,
            subJobId,
            subJob.provider,
            providerAmount
        );

        if (
            job.settledChunks == job.totalChunks
        ) {
            job.status = JobStatus.SETTLED;

            emit JobSettled(jobId);
        }
    }

    // ============================================================
    // CANCEL MAIN JOB
    // ============================================================

    function cancelJob(
        uint256 jobId
    ) external nonReentrant {
        Job storage job = jobs[jobId];

        require(
            msg.sender == job.requester,
            "Not requester"
        );

        require(
            job.status == JobStatus.OPEN,
            "Cannot cancel"
        );

        paymentToken.transfer(
            job.requester,
            job.reward
        );

        job.status = JobStatus.CANCELLED;

        emit JobCancelled(jobId);
    }

    // ============================================================
    // DISPUTE
    // ============================================================

    function raiseDispute(
        uint256 jobId,
        uint256 subJobId,
        bytes32 evidenceHash
    ) external {
        Job storage job = jobs[jobId];
        SubJob storage subJob = subJobs[jobId][subJobId];

        require(
            msg.sender == job.requester,
            "Not requester"
        );

        require(
            subJob.status == SubJobStatus.COMPLETED,
            "Invalid status"
        );

        subJob.status = SubJobStatus.DISPUTED;

        emit JobDisputed(
            jobId,
            subJobId,
            evidenceHash
        );
    }

    // ============================================================
    // RESOLVE DISPUTE
    // ============================================================

    function resolveDispute(
        uint256 jobId,
        uint256 subJobId,
        bool providerWon
    ) external onlyOwner nonReentrant {
        Job storage job = jobs[jobId];
        SubJob storage subJob = subJobs[jobId][subJobId];

        require(
            subJob.status == SubJobStatus.DISPUTED,
            "Not disputed"
        );

        if (providerWon) {
            subJob.status = SubJobStatus.VERIFIED;
        } else {
            uint256 slashAmount =
                providerRegistry.getStake(
                    subJob.provider
                ) / 10;

            if (slashAmount > 0) {
                providerRegistry.slash(
                    subJob.provider,
                    slashAmount
                );
            }

            paymentToken.transfer(
                job.requester,
                subJob.reward
            );

            subJob.status = SubJobStatus.CANCELLED;

            providerRegistry.decreaseActiveJobs(
                subJob.provider
            );
        }

        emit DisputeResolved(
            jobId,
            subJobId,
            providerWon
        );
    }

    // ============================================================
    // EXPIRE JOB
    // ============================================================

    function expireJob(
        uint256 jobId
    ) external nonReentrant {
        Job storage job = jobs[jobId];

        require(
            block.timestamp >= job.deadline,
            "Deadline not reached"
        );

        require(
            job.status == JobStatus.OPEN,
            "Job not open"
        );

        paymentToken.transfer(
            job.requester,
            job.reward
        );

        job.status = JobStatus.CANCELLED;

        emit JobCancelled(jobId);
    }
}