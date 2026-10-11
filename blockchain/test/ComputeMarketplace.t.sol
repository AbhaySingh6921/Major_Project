// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ComputeMarketplace} from "../src/ComputeMarketplace.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {ProviderRegistry} from "../src/ProviderRegistry.sol";

contract ComputeMarketplaceTest is Test {
    ComputeMarketplace marketplace;
    ProviderRegistry registry;
    MockUSDC usdc;

    address requester = address(1);
    address provider1 = address(2);
    address provider2 = address(3);

    uint256 constant REWARD = 100 ether;

    function setUp() public {
        usdc = new MockUSDC();

        registry = new ProviderRegistry(address(usdc));

        marketplace = new ComputeMarketplace(
            address(usdc),
            address(registry)
        );

        registry.setMarketplace(address(marketplace));

        usdc.mint(requester, 1000 ether);
        usdc.mint(provider1, 1000 ether);
        usdc.mint(provider2, 1000 ether);

        // Register providers and stake
        vm.startPrank(provider1);
        registry.registerProvider("ipfs://provider1");
        usdc.approve(address(registry), 100 ether);
        registry.stake(100 ether);
        vm.stopPrank();

        vm.startPrank(provider2);
        registry.registerProvider("ipfs://provider2");
        usdc.approve(address(registry), 100 ether);
        registry.stake(100 ether);
        vm.stopPrank();
    }

    function createTestJob() internal {
        bytes32[5] memory inputHashes;
        bytes32[5] memory expectedOutputHashes;

        for (uint256 i = 0; i < 5; i++) {
            inputHashes[i] = keccak256(
                abi.encodePacked("input", i)
            );

            expectedOutputHashes[i] = keccak256(
                abi.encodePacked("result", i)
            );
        }

        vm.startPrank(requester);

        usdc.approve(
            address(marketplace),
            REWARD
        );

        marketplace.createJob(
            "ipfs://test-dataset",
            REWARD,
            block.timestamp + 1 days,
            inputHashes,
            expectedOutputHashes
        );

        vm.stopPrank();
    }

    // ============================================================
    // CREATE JOB
    // ============================================================

    function testCreateJob() public {
        createTestJob();

        (
            uint256 jobId,
            address jobRequester,
            string memory datasetCID,
            uint256 totalChunks,
            uint256 reward,
            ,
            ,
            ,
            ComputeMarketplace.JobStatus status
        ) = marketplace.jobs(0);

        assertEq(jobId, 0);
        assertEq(jobRequester, requester);
        assertEq(datasetCID, "ipfs://test-dataset");
        assertEq(totalChunks, 5);
        assertEq(reward, REWARD);

        assertEq(
            uint256(status),
            uint256(
                ComputeMarketplace.JobStatus.OPEN
            )
        );
    }

    // ============================================================
    // CHECK SUBJOB
    // ============================================================

    function testSubJobsCreated() public {
        createTestJob();

        for (uint256 i = 0; i < 5; i++) {
            (
                uint256 subJobId,
                uint256 jobId,
                uint256 chunkIndex,
                address provider,
                uint256 reward,
                ,
                ,
                ,
                ComputeMarketplace.SubJobStatus status
            ) = marketplace.subJobs(0, i);

            assertEq(subJobId, i);
            assertEq(jobId, 0);
            assertEq(chunkIndex, i);
            assertEq(provider, address(0));
            assertEq(reward, 20 ether);

            assertEq(
                uint256(status),
                uint256(
                    ComputeMarketplace.SubJobStatus.OPEN
                )
            );
        }
    }

    // ============================================================
    // ACCEPT SUBJOB
    // ============================================================

    function testAcceptSubJob() public {
        createTestJob();

        vm.prank(provider1);
        marketplace.acceptSubJob(0, 0);

        (
            ,
            ,
            ,
            address provider,
            ,
            ,
            ,
            ,
            ComputeMarketplace.SubJobStatus status
        ) = marketplace.subJobs(0, 0);

        assertEq(provider, provider1);

        assertEq(
            uint256(status),
            uint256(
                ComputeMarketplace.SubJobStatus.ACCEPTED
            )
        );
    }

    // ============================================================
    // SUBMIT RESULT
    // ============================================================

    function testSubmitSubJobResult() public {
        createTestJob();

        vm.prank(provider1);
        marketplace.acceptSubJob(0, 0);

        bytes32 resultHash = keccak256("result0");

        vm.prank(provider1);
        marketplace.submitSubJobResult(
            0,
            0,
            resultHash
        );

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            bytes32 outputHash,
            ComputeMarketplace.SubJobStatus status
        ) = marketplace.subJobs(0, 0);

        assertEq(outputHash, resultHash);

        assertEq(
            uint256(status),
            uint256(
                ComputeMarketplace.SubJobStatus.COMPLETED
            )
        );
    }

    // ============================================================
    // VERIFY SUBJOB
    // ============================================================

    function testVerifySubJob() public {
        createTestJob();

        vm.prank(provider1);
        marketplace.acceptSubJob(0, 0);

        bytes32 resultHash = keccak256(
            abi.encodePacked("result", uint256(0))
        );

        vm.prank(provider1);
        marketplace.submitSubJobResult(
            0,
            0,
            resultHash
        );

        marketplace.verifySubJob(0, 0);

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ComputeMarketplace.SubJobStatus status
        ) = marketplace.subJobs(0, 0);

        assertEq(
            uint256(status),
            uint256(
                ComputeMarketplace.SubJobStatus.VERIFIED
            )
        );
    }

    // ============================================================
    // SETTLE SUBJOB
    // ============================================================

    function testSettleSubJob() public {
        createTestJob();

        vm.prank(provider1);
        marketplace.acceptSubJob(0, 0);

        bytes32 resultHash = keccak256(
            abi.encodePacked("result", uint256(0))
        );

        vm.prank(provider1);
        marketplace.submitSubJobResult(
            0,
            0,
            resultHash
        );

        marketplace.verifySubJob(0, 0);

        uint256 balanceBefore =
            usdc.balanceOf(provider1);

        marketplace.settleSubJob(0, 0);

        uint256 balanceAfter =
            usdc.balanceOf(provider1);

        // 20 USDC - 5% fee = 19 USDC
        assertEq(
            balanceAfter - balanceBefore,
            19 ether
        );
    }

    // ============================================================
    // MULTIPLE PROVIDERS
    // ============================================================

    function testMultipleProviders() public {
        createTestJob();

        vm.prank(provider1);
        marketplace.acceptSubJob(0, 0);

        vm.prank(provider2);
        marketplace.acceptSubJob(0, 1);

        (
            ,
            ,
            ,
            address p1,
            ,
            ,
            ,
            ,
            
        ) = marketplace.subJobs(0, 0);

        (
            ,
            ,
            ,
            address p2,
            ,
            ,
            ,
            ,
            
        ) = marketplace.subJobs(0, 1);

        assertEq(p1, provider1);
        assertEq(p2, provider2);
    }

    // ============================================================
    // CANCEL JOB
    // ============================================================

    function testCancelJob() public {
        createTestJob();

        uint256 balanceBefore =
            usdc.balanceOf(requester);

        vm.prank(requester);
        marketplace.cancelJob(0);

        uint256 balanceAfter =
            usdc.balanceOf(requester);

        assertEq(
            balanceAfter - balanceBefore,
            REWARD
        );
    }

    // ============================================================
    // EXPIRE JOB
    // ============================================================

    function testExpireJob() public {
        createTestJob();

        vm.warp(block.timestamp + 2 days);

        uint256 balanceBefore =
            usdc.balanceOf(requester);

        marketplace.expireJob(0);

        uint256 balanceAfter =
            usdc.balanceOf(requester);

        assertEq(
            balanceAfter - balanceBefore,
            REWARD
        );
    }
}