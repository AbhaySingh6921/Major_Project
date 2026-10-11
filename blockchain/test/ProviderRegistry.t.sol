// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ProviderRegistry} from "../src/ProviderRegistry.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {ComputeMarketplace} from "../src/ComputeMarketplace.sol";

contract ProviderRegistryTest is Test {
    ProviderRegistry registry;
    MockUSDC usdc;
    ComputeMarketplace marketplace;

    address provider = address(1);

    function setUp() public {
        usdc = new MockUSDC();

        registry = new ProviderRegistry(
            address(usdc)
        );

        marketplace = new ComputeMarketplace(
            address(usdc),
            address(registry)
        );

        registry.setMarketplace(
            address(marketplace)
        );

        usdc.mint(
            provider,
            1000 ether
        );
    }

    function testRegisterProvider() public {
        vm.prank(provider);

        registry.registerProvider(
            "ipfs://provider-metadata"
        );

        assertTrue(
            registry.isProvider(provider)
        );
    }

    function testStake() public {
        vm.startPrank(provider);

        registry.registerProvider(
            "ipfs://provider-metadata"
        );

        usdc.approve(
            address(registry),
            100 ether
        );

        registry.stake(100 ether);

        vm.stopPrank();

        assertEq(
            registry.getStake(provider),
            100 ether
        );
    }

    function testUnstake() public {
        vm.startPrank(provider);

        registry.registerProvider(
            "ipfs://provider-metadata"
        );

        usdc.approve(
            address(registry),
            100 ether
        );

        registry.stake(100 ether);
        registry.unstake(40 ether);

        vm.stopPrank();

        assertEq(
            registry.getStake(provider),
            60 ether
        );
    }

    function testSlash() public {
    vm.startPrank(provider);

    registry.registerProvider(
        "ipfs://provider-metadata"
    );

    usdc.approve(
        address(registry),
        100 ether
    );

    registry.stake(100 ether);

    vm.stopPrank();

    // Pretend the marketplace contract is calling slash()
    vm.prank(address(marketplace));

    registry.slash(
        provider,
        30 ether
    );

    assertEq(
        registry.getStake(provider),
        70 ether
    );
}
}