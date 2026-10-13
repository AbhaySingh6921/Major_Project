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
}

export interface ProviderNode {
  address: string;
  name: string;
  stakedAmount: number;
  activeJobs: number;
  completedJobs: number;
  status: 'online' | 'idle' | 'busy';
  lastHeartbeat: string;
}
