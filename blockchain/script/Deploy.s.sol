// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
 import {console2} from "forge-std/console2.sol";
import {ProviderRegistry} from "../src/ProviderRegistry.sol";
import {ComputeMarketplace} from "../src/ComputeMarketplace.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy USDC
        MockUSDC usdc = new MockUSDC();

        // 2. Deploy Provider Registry
        ProviderRegistry registry = new ProviderRegistry(
            address(usdc)
        );

        // 3. Deploy Marketplace
        ComputeMarketplace marketplace = new ComputeMarketplace(
            address(usdc),
            address(registry)
        );

        // 4. Connect Registry → Marketplace
        registry.setMarketplace(
            address(marketplace)
        );

        console2.log("MockUSDC:", address(usdc));
        console2.log("ProviderRegistry:", address(registry));
        console2.log("ComputeMarketplace:", address(marketplace));

        vm.stopBroadcast();
    }
}