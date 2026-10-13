export type UserRole = 'requester' | 'provider' | 'admin' | null;

export interface AuthState {
  isAuthenticated: boolean;
  walletAddress: string | null;
  role: UserRole;
  usdcBalance?: number;
  stakedAmount?: number;
}

export interface JobChunk {
  chunkIndex: number;
  inputHash: string;
  expectedOutputHash: string;
  outputHash?: string;
  providerAddress?: string;
  reward: number;
  status: 'OPEN' | 'ACCEPTED' | 'COMPLETED' | 'VERIFIED' | 'DISPUTED';
  executionTimeSec?: number;
}

export interface MarketplaceJob {
  id: string;
  blockchainJobId: number;
  datasetName: string;
  requester: string;
  totalReward: number;
  totalChunks: number;
  completedChunks: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'SETTLED' | 'CANCELLED';
  createdAt: string;
  deadline: string;
  chunks: JobChunk[];
  logs?: string[];
  fileSizeMb?: number;
  rowCount?: number;
}

export interface ComputeNode {
  id: string;
  name: string;
  address: string;
  cpu: string;
  memory: string;
  gpu: string;
  availability: number;
  health: 'Healthy' | 'Idle' | 'High Load' | 'Offline';
  lastHeartbeat: string;
  assignedJobsCount: number;
  completedJobsCount: number;
  stakedAmount: number;
  ipAddress?: string;
  dockerVersion?: string;
  uptimeHours?: number;
}

export interface AssignedSubJob {
  id: string;
  jobId: string;
  datasetName: string;
  subJobId: number;
  chunkIndex: number;
  reward: number;
  inputHash: string;
  expectedOutputHash: string;
  outputHash?: string;
  status: 'OPEN' | 'ACCEPTED' | 'COMPLETED' | 'VERIFIED';
  progress: number;
  nodeId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TransactionRecord {
  id: string;
  type: 'reward' | 'stake' | 'escrow_deposit' | 'unstake';
  amount: number;
  jobId?: string;
  txHash: string;
  timestamp: string;
  status: 'completed' | 'pending';
  note?: string;
}
