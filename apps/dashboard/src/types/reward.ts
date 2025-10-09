export interface Developer {
  id: string;
  name: string;
  github_username: string;
  email: string;
  walletAddress: string;
  avatar?: string;
}

export interface RewardActivity {
  type: "commit" | "pr" | "ticket";
  description: string;
  repository?: string;
  ticketId?: string;
  points: number;
  count?: number;
}

export interface Reward {
  id: number | string;
  developerId: string;
  developer: Developer;
  activities: RewardActivity[];
  totalTokens: number;
  status: "pending" | "manager_approved" | "fully_approved" | "distributed";
  managerApproval?: {
    approved: boolean;
    approvedBy: string;
    approvedAt: Date;
    comment?: string;
  };
  hrApproval?: {
    approved: boolean;
    approvedBy: string;
    approvedAt: Date;
    comment?: string;
  };
  period?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeveloperStats {
  totalRewardsReceived: number;
  totalPendingRewards: number;
  completedRewards: number;
  thisMonthRewards: number;
}
