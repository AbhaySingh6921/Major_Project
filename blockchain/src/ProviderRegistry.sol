// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProviderRegistry is Ownable {
    IERC20 public immutable stakingToken;
    address public marketplace;

    struct Provider {
        uint256 stake;
        string metadataURI;
        bool registered;
    }

    mapping(address => Provider) public providers;
    //prevent providers from withdrawing locked stake while they have active jobs//
    mapping(address => uint256) public activeJobs;

    event ProviderRegistered(address indexed provider, string metadataURI);
    event ProviderStaked(address indexed provider, uint256 amount);
    event ProviderUnstaked(address indexed provider, uint256 amount);
    event ProviderSlashed(address indexed provider, uint256 amount);

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    function registerProvider(string calldata metadataURI) external {
        require(!providers[msg.sender].registered, "Already registered");

        providers[msg.sender] = Provider({stake: 0, metadataURI: metadataURI, registered: true});

        emit ProviderRegistered(msg.sender, metadataURI);
    }

    function stake(uint256 amount) external {
        require(providers[msg.sender].registered, "Not registered");
        require(amount > 0, "Invalid amount");

        stakingToken.transferFrom(msg.sender, address(this), amount);

        providers[msg.sender].stake += amount;

        emit ProviderStaked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(activeJobs[msg.sender] == 0, "Active jobs exist");

        require(providers[msg.sender].stake >= amount, "Insufficient stake");

        providers[msg.sender].stake -= amount;

        stakingToken.transfer(msg.sender, amount);

        emit ProviderUnstaked(msg.sender, amount);
    }

    function isProvider(address provider) external view returns (bool) {
        return providers[provider].registered;
    }

    function getStake(address provider) external view returns (uint256) {
        return providers[provider].stake;
    }

    function slash(address provider, uint256 amount) external {
        require(msg.sender == marketplace, "Not marketplace");
        require(providers[provider].stake >= amount, "Insufficient stake");

        providers[provider].stake -= amount;

        emit ProviderSlashed(provider, amount);
    }

    function setMarketplace(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "Invalid address");
        marketplace = _marketplace;
    }

    function increaseActiveJobs(address provider) external {
        require(msg.sender == marketplace, "Not marketplace");

        activeJobs[provider]++;
    }

    function decreaseActiveJobs(address provider) external {
        require(msg.sender == marketplace, "Not marketplace");

        require(activeJobs[provider] > 0, "No active jobs");

        activeJobs[provider]--;
    }

    function hasEnoughStake(address provider, uint256 requiredStake) external view returns (bool) {
        return providers[provider].stake >= requiredStake;
    }
}

// ///registerProvider() → provider joins marketplace
// stake()            → deposits collateral
// unstake()          → withdraws collateral
// isProvider()       → checks registration
// getStake()         → checks stake
// slash()            → penalizes provider
// ///
