import React, { createContext, useContext, useState, useEffect } from 'react';
import { MarketplaceJob, ComputeNode, AssignedSubJob, TransactionRecord, AuthState, UserRole } from '../types';

interface MarketplaceContextType {
  auth: AuthState;
  backendOnline: boolean | null;
  jobs: MarketplaceJob[];
  nodes: ComputeNode[];
  assignedJobs: AssignedSubJob[];
  transactions: TransactionRecord[];
  loginAs: (role: 'requester' | 'provider', address?: string) => void;
  logout: () => void;
  createNewJob: (data: { datasetName: string; totalReward: number; deadlineHours: number; file?: File }) => Promise<MarketplaceJob>;
  acceptAndExecuteSubJob: (subJobId: string) => Promise<void>;
  registerNode: (node: Partial<ComputeNode>) => void;
  stakeMoreCollateral: (amount: number) => void;
  claimProviderEarnings: () => void;
  getJobById: (id: string) => MarketplaceJob | undefined;
  getNodeById: (id: string) => ComputeNode | undefined;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('decompute-auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      isAuthenticated: true,
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      role: 'requester',
      usdcBalance: 2450,
      stakedAmount: 250,
    };
  });

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Initial realistic jobs data
  const [jobs, setJobs] = useState<MarketplaceJob[]>([
    {
      id: 'job-101',
      blockchainJobId: 101,
      datasetName: 'financial_fraud_detection_batch_1.csv',
      requester: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      totalReward: 50,
      totalChunks: 5,
      completedChunks: 5,
      status: 'VERIFIED',
      createdAt: '2026-10-12 11:20',
      deadline: '2026-10-14 11:20',
      fileSizeMb: 14.2,
      rowCount: 120500,
      logs: [
        '[11:20:01] Workload received: financial_fraud_detection_batch_1.csv',
        '[11:20:03] Deterministic partition completed: 5 chunks created',
        '[11:20:05] Smart Contract ComputeMarketplace.sol: Escrow 50 USDC locked (tx: 0x8a92...31c)',
        '[11:22:15] Chunk 0, 1, 2, 3, 4 completed by provider nodes',
        '[11:22:40] SHA-256 output hashes verified against expected hashes',
        '[11:23:00] Aggregation completed. Result file generated.',
      ],
      chunks: [
        { chunkIndex: 0, inputHash: '0x8f2a...c31b', expectedOutputHash: '0x33e1...24fd', outputHash: '0x33e1...24fd', reward: 10, status: 'VERIFIED', providerAddress: '0x90F7...b906', executionTimeSec: 14.2 },
        { chunkIndex: 1, inputHash: '0x1c4e...89d2', expectedOutputHash: '0x55d2...389c', outputHash: '0x55d2...389c', reward: 10, status: 'VERIFIED', providerAddress: '0x90F7...b906', executionTimeSec: 15.1 },
        { chunkIndex: 2, inputHash: '0x7e02...41a8', expectedOutputHash: '0x9a8b...6421', outputHash: '0x9a8b...6421', reward: 10, status: 'VERIFIED', providerAddress: '0x15d3...9821', executionTimeSec: 13.8 },
        { chunkIndex: 3, inputHash: '0x99b1...55e0', expectedOutputHash: '0x42ff...bb52', outputHash: '0x42ff...bb52', reward: 10, status: 'VERIFIED', providerAddress: '0x9965...d201', executionTimeSec: 14.5 },
        { chunkIndex: 4, inputHash: '0x43d7...f26a', expectedOutputHash: '0x77c4...33e8', outputHash: '0x77c4...33e8', reward: 10, status: 'VERIFIED', providerAddress: '0x976e...981c', executionTimeSec: 14.0 },
      ],
    },
    {
      id: 'job-102',
      blockchainJobId: 102,
      datasetName: 'sensor_telemetry_iot_eu.csv',
      requester: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      totalReward: 25,
      totalChunks: 5,
      completedChunks: 3,
      status: 'IN_PROGRESS',
      createdAt: '2026-10-13 09:15',
      deadline: '2026-10-14 09:15',
      fileSizeMb: 8.5,
      rowCount: 75000,
      logs: [
        '[09:15:10] Workload received: sensor_telemetry_iot_eu.csv',
        '[09:15:14] 5 subjob chunks deployed to ComputeMarketplace.sol',
        '[09:18:22] Chunk 0 & 1 verified and settled',
        '[09:21:40] Chunk 2 verified and settled',
        '[09:25:01] Chunk 3 & 4 currently executing on provider worker daemons',
      ],
      chunks: [
        { chunkIndex: 0, inputHash: '0x3a4b...99fa', expectedOutputHash: '0x66c1...982a', outputHash: '0x66c1...982a', reward: 5, status: 'VERIFIED', providerAddress: '0x90F7...b906', executionTimeSec: 8.4 },
        { chunkIndex: 1, inputHash: '0x88f1...12c8', expectedOutputHash: '0x77d2...55b1', outputHash: '0x77d2...55b1', reward: 5, status: 'VERIFIED', providerAddress: '0x90F7...b906', executionTimeSec: 8.9 },
        { chunkIndex: 2, inputHash: '0x11a3...44e7', expectedOutputHash: '0x88e3...44c2', outputHash: '0x88e3...44c2', reward: 5, status: 'VERIFIED', providerAddress: '0x15d3...9821', executionTimeSec: 9.1 },
        { chunkIndex: 3, inputHash: '0x99c2...77d1', expectedOutputHash: '0x11f4...77a9', reward: 5, status: 'ACCEPTED', providerAddress: '0x9965...d201' },
        { chunkIndex: 4, inputHash: '0x55b4...22f3', expectedOutputHash: '0x22a5...88b3', reward: 5, status: 'OPEN' },
      ],
    },
    {
      id: 'job-103',
      blockchainJobId: 103,
      datasetName: 'genomic_sequence_alignment_test.csv',
      requester: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      totalReward: 100,
      totalChunks: 5,
      completedChunks: 5,
      status: 'SETTLED',
      createdAt: '2026-10-11 16:45',
      deadline: '2026-10-12 16:45',
      fileSizeMb: 35.0,
      rowCount: 450000,
      logs: [
        '[16:45:00] Job submitted and 100 USDC escrow deposited',
        '[17:10:00] All 5 subjobs executed, verified, and settled with 5% protocol fee',
      ],
      chunks: [
        { chunkIndex: 0, inputHash: '0xfa11...22b1', expectedOutputHash: '0xaa12...33c4', outputHash: '0xaa12...33c4', reward: 20, status: 'VERIFIED', providerAddress: '0x90F7...b906' },
        { chunkIndex: 1, inputHash: '0xfb22...33c2', expectedOutputHash: '0xbb23...44d5', outputHash: '0xbb23...44d5', reward: 20, status: 'VERIFIED', providerAddress: '0x90F7...b906' },
        { chunkIndex: 2, inputHash: '0xfc33...44d3', expectedOutputHash: '0xcc34...55e6', outputHash: '0xcc34...55e6', reward: 20, status: 'VERIFIED', providerAddress: '0x15d3...9821' },
        { chunkIndex: 3, inputHash: '0xfd44...55e4', expectedOutputHash: '0xdd45...66f7', outputHash: '0xdd45...66f7', reward: 20, status: 'VERIFIED', providerAddress: '0x9965...d201' },
        { chunkIndex: 4, inputHash: '0xfe55...66f5', expectedOutputHash: '0xee56...77a8', outputHash: '0xee56...77a8', reward: 20, status: 'VERIFIED', providerAddress: '0x976e...981c' },
      ],
    },
  ]);

  // Initial realistic nodes data
  const [nodes, setNodes] = useState<ComputeNode[]>([
    {
      id: 'node-01',
      name: 'Alpha-Worker-US',
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      cpu: '16 vCPU (AMD EPYC 7763)',
      memory: '64 GB DDR4 ECC',
      gpu: 'NVIDIA RTX 4090 24GB VRAM',
      availability: 99.8,
      health: 'Healthy',
      lastHeartbeat: '12s ago',
      assignedJobsCount: 1,
      completedJobsCount: 84,
      stakedAmount: 250,
      ipAddress: '198.51.100.42',
      dockerVersion: 'v24.0.7',
      uptimeHours: 342,
    },
    {
      id: 'node-02',
      name: 'Beta-Compute-EU',
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      cpu: '8 vCPU (Intel Xeon Platinum)',
      memory: '32 GB DDR4',
      gpu: 'CPU Only (Optimized BLAS)',
      availability: 99.4,
      health: 'Idle',
      lastHeartbeat: '45s ago',
      assignedJobsCount: 0,
      completedJobsCount: 42,
      stakedAmount: 150,
      ipAddress: '203.0.113.18',
      dockerVersion: 'v24.0.5',
      uptimeHours: 198,
    },
    {
      id: 'node-03',
      name: 'Gamma-Runner-AP',
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      cpu: '32 vCPU (Ampere Altra ARM)',
      memory: '128 GB DDR4',
      gpu: 'NVIDIA A100 80GB SXM',
      availability: 98.9,
      health: 'High Load',
      lastHeartbeat: '4s ago',
      assignedJobsCount: 2,
      completedJobsCount: 119,
      stakedAmount: 500,
      ipAddress: '198.51.100.89',
      dockerVersion: 'v24.0.7',
      uptimeHours: 720,
    },
  ]);

  // Initial assigned subjobs for provider
  const [assignedJobs, setAssignedJobs] = useState<AssignedSubJob[]>([
    {
      id: 'sub-102-3',
      jobId: 'job-102',
      datasetName: 'sensor_telemetry_iot_eu.csv',
      subJobId: 3,
      chunkIndex: 3,
      reward: 5,
      inputHash: '0x99c2...77d1',
      expectedOutputHash: '0x11f4...77a9',
      status: 'ACCEPTED',
      progress: 65,
      nodeId: 'node-01',
      startedAt: '10 mins ago',
    },
    {
      id: 'sub-102-4',
      jobId: 'job-102',
      datasetName: 'sensor_telemetry_iot_eu.csv',
      subJobId: 4,
      chunkIndex: 4,
      reward: 5,
      inputHash: '0x55b4...22f3',
      expectedOutputHash: '0x22a5...88b3',
      status: 'OPEN',
      progress: 0,
    },
    {
      id: 'sub-101-0',
      jobId: 'job-101',
      datasetName: 'financial_fraud_detection_batch_1.csv',
      subJobId: 0,
      chunkIndex: 0,
      reward: 10,
      inputHash: '0x8f2a...c31b',
      expectedOutputHash: '0x33e1...24fd',
      outputHash: '0x33e1...24fd',
      status: 'VERIFIED',
      progress: 100,
      nodeId: 'node-01',
      completedAt: 'Yesterday',
    },
  ]);

  // Provider transactions & earnings
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx-01',
      type: 'reward',
      amount: 9.5, // 10 USDC minus 5% platform fee = 9.5 USDC
      jobId: 'job-101',
      txHash: '0x7b1a45...89e2',
      timestamp: '2026-10-12 11:25',
      status: 'completed',
      note: 'Chunk 0 reward settlement (5% protocol fee deducted)',
    },
    {
      id: 'tx-02',
      type: 'reward',
      amount: 9.5,
      jobId: 'job-101',
      txHash: '0x3c2b81...44f9',
      timestamp: '2026-10-12 11:26',
      status: 'completed',
      note: 'Chunk 1 reward settlement (5% protocol fee deducted)',
    },
    {
      id: 'tx-03',
      type: 'stake',
      amount: 250,
      txHash: '0x99a12c...55d0',
      timestamp: '2026-10-10 09:00',
      status: 'completed',
      note: 'Collateral locked in ProviderRegistry.sol',
    },
  ]);

  // Check backend server on localhost:5000
  useEffect(() => {
    fetch('/api/providers/subjobs/open')
      .then((res) => {
        if (res.ok) setBackendOnline(true);
        else setBackendOnline(false);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('decompute-auth', JSON.stringify(auth));
  }, [auth]);

  const loginAs = (role: 'requester' | 'provider', address?: string) => {
    const addr = address || (role === 'requester' ? '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' : '0x90F79bf6EB2c4f870365E785982E1f101E93b906');
    setAuth({
      isAuthenticated: true,
      walletAddress: addr,
      role: role,
      usdcBalance: role === 'requester' ? 2450 : 790,
      stakedAmount: role === 'provider' ? 250 : 0,
    });
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      walletAddress: null,
      role: null,
      usdcBalance: 0,
      stakedAmount: 0,
    });
  };

  const createNewJob = async (data: { datasetName: string; totalReward: number; deadlineHours: number; file?: File }) => {
    const subJobReward = data.totalReward / 5;
    const deadlineDate = new Date(Date.now() + data.deadlineHours * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');

    const newChunks = Array.from({ length: 5 }, (_, i) => ({
      chunkIndex: i,
      inputHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      expectedOutputHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      reward: subJobReward,
      status: 'OPEN' as const,
    }));

    const newJob: MarketplaceJob = {
      id: `job-${100 + jobs.length + 1}`,
      blockchainJobId: 100 + jobs.length + 1,
      datasetName: data.datasetName,
      requester: auth.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      totalReward: data.totalReward,
      totalChunks: 5,
      completedChunks: 0,
      status: 'OPEN',
      createdAt: 'Just now',
      deadline: deadlineDate,
      fileSizeMb: data.file ? Number((data.file.size / (1024 * 1024)).toFixed(1)) : 12.0,
      rowCount: 100000,
      logs: [
        `[${new Date().toLocaleTimeString()}] Workload created: ${data.datasetName}`,
        `[${new Date().toLocaleTimeString()}] Partitioned into 5 verifiable sub-chunks`,
        `[${new Date().toLocaleTimeString()}] Escrow locked: ${data.totalReward} USDC on ComputeMarketplace.sol`,
      ],
      chunks: newChunks,
    };

    // Also populate open subjobs into provider queue
    const newAssigned: AssignedSubJob[] = newChunks.map((c, i) => ({
      id: `sub-${newJob.id}-${i}`,
      jobId: newJob.id,
      datasetName: newJob.datasetName,
      subJobId: i,
      chunkIndex: i,
      reward: subJobReward,
      inputHash: c.inputHash,
      expectedOutputHash: c.expectedOutputHash,
      status: 'OPEN',
      progress: 0,
    }));

    setJobs((prev) => [newJob, ...prev]);
    setAssignedJobs((prev) => [...newAssigned, ...prev]);

    // Deduct requester balance
    setAuth((prev) => ({
      ...prev,
      usdcBalance: Math.max(0, (prev.usdcBalance || 0) - data.totalReward),
    }));

    return newJob;
  };

  const acceptAndExecuteSubJob = async (subJobId: string) => {
    // 1. Mark accepted
    setAssignedJobs((prev) =>
      prev.map((s) => (s.id === subJobId ? { ...s, status: 'ACCEPTED', progress: 30 } : s))
    );

    // 2. Simulate worker container execution
    await new Promise((r) => setTimeout(r, 1200));
    setAssignedJobs((prev) =>
      prev.map((s) => (s.id === subJobId ? { ...s, progress: 75 } : s))
    );

    await new Promise((r) => setTimeout(r, 800));

    // 3. Mark completed & verified
    setAssignedJobs((prev) =>
      prev.map((s) =>
        s.id === subJobId
          ? {
              ...s,
              status: 'VERIFIED',
              progress: 100,
              outputHash: s.expectedOutputHash,
              completedAt: 'Just now',
            }
          : s
      )
    );

    // Update parent job's chunk in requester view
    const target = assignedJobs.find((s) => s.id === subJobId);
    if (target) {
      setJobs((prevJobs) =>
        prevJobs.map((j) => {
          if (j.id === target.jobId) {
            const updatedChunks = j.chunks.map((c) =>
              c.chunkIndex === target.chunkIndex
                ? { ...c, status: 'VERIFIED' as const, outputHash: c.expectedOutputHash, providerAddress: auth.walletAddress || '0x90F7...b906' }
                : c
            );
            const verifiedCount = updatedChunks.filter((c) => c.status === 'VERIFIED').length;
            return {
              ...j,
              chunks: updatedChunks,
              completedChunks: verifiedCount,
              status: verifiedCount === 5 ? ('VERIFIED' as const) : ('IN_PROGRESS' as const),
            };
          }
          return j;
        })
      );

      // Add earning transaction (reward minus 5% platform fee)
      const netReward = Number((target.reward * 0.95).toFixed(2));
      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        type: 'reward',
        amount: netReward,
        jobId: target.jobId,
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        timestamp: 'Just now',
        status: 'completed',
        note: `Chunk ${target.chunkIndex} verified. 5% platform protocol fee retained.`,
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Update provider balance
      setAuth((prev) => ({
        ...prev,
        usdcBalance: (prev.usdcBalance || 0) + netReward,
      }));
    }
  };

  const registerNode = (nodeData: Partial<ComputeNode>) => {
    const newNode: ComputeNode = {
      id: `node-0${nodes.length + 1}`,
      name: nodeData.name || `Node-${nodes.length + 1}`,
      address: auth.walletAddress || '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      cpu: nodeData.cpu || '16 vCPU (Intel Xeon)',
      memory: nodeData.memory || '64 GB DDR4',
      gpu: nodeData.gpu || 'CPU Only',
      availability: 100,
      health: 'Healthy',
      lastHeartbeat: 'Just now',
      assignedJobsCount: 0,
      completedJobsCount: 0,
      stakedAmount: 100,
      dockerVersion: 'v24.0.7',
      uptimeHours: 1,
    };
    setNodes((prev) => [newNode, ...prev]);
  };

  const stakeMoreCollateral = (amount: number) => {
    setAuth((prev) => ({
      ...prev,
      stakedAmount: (prev.stakedAmount || 0) + amount,
      usdcBalance: Math.max(0, (prev.usdcBalance || 0) - amount),
    }));
    const newTx: TransactionRecord = {
      id: `tx-stake-${Date.now()}`,
      type: 'stake',
      amount: amount,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      timestamp: 'Just now',
      status: 'completed',
      note: 'Collateral staked via ProviderRegistry.sol',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const claimProviderEarnings = () => {
    // claim simulated
  };

  const getJobById = (id: string) => jobs.find((j) => j.id === id || String(j.blockchainJobId) === id);
  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  return (
    <MarketplaceContext.Provider
      value={{
        auth,
        backendOnline,
        jobs,
        nodes,
        assignedJobs,
        transactions,
        loginAs,
        logout,
        createNewJob,
        acceptAndExecuteSubJob,
        registerNode,
        stakeMoreCollateral,
        claimProviderEarnings,
        getJobById,
        getNodeById,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
