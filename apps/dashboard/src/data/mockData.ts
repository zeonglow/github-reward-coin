import { Developer, Reward, RewardActivity } from "../../../../types/reward";

export const mockDevelopers: Developer[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    walletAddress: "0x1234567890123456789012345678901234567890",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b332fd12?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@company.com",
    walletAddress: "0x2345678901234567890123456789012345678901",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.davis@company.com",
    walletAddress: "0x3456789012345678901234567890123456789012",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david.wilson@company.com",
    walletAddress: "0x4567890123456789012345678901234567890123",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
];

export const mockRewards: Reward[] = [
  {
    id: "reward-1",
    developerId: "1",
    developer: mockDevelopers[0],
    activities: [
      {
        type: "commit",
        description: "Implemented user authentication system",
        repository: "web-app",
        points: 50,
      },
      {
        type: "pr",
        description: "Added API rate limiting middleware",
        repository: "backend-api",
        points: 40,
      },
      {
        type: "ticket",
        description: "Fixed critical security vulnerability",
        ticketId: "TICK-123",
        points: 60,
      },
    ],
    totalTokens: 150,
    status: "pending",
    createdAt: new Date("2024-10-01T10:00:00Z"),
    updatedAt: new Date("2024-10-01T10:00:00Z"),
  },
  {
    id: "reward-2",
    developerId: "2",
    developer: mockDevelopers[1],
    activities: [
      {
        type: "commit",
        description: "Refactored database queries for better performance",
        repository: "backend-api",
        points: 35,
      },
      {
        type: "ticket",
        description: "Implemented new dashboard features",
        ticketId: "TICK-124",
        points: 45,
      },
    ],
    totalTokens: 80,
    status: "manager_approved",
    managerApproval: {
      approved: true,
      approvedBy: "John Manager",
      approvedAt: new Date("2024-10-02T14:30:00Z"),
      comment: "Great work on performance improvements",
    },
    createdAt: new Date("2024-09-28T09:15:00Z"),
    updatedAt: new Date("2024-10-02T14:30:00Z"),
  },
  {
    id: "reward-3",
    developerId: "3",
    developer: mockDevelopers[2],
    activities: [
      {
        type: "pr",
        description: "Added comprehensive unit tests",
        repository: "web-app",
        points: 30,
      },
      {
        type: "commit",
        description: "Updated documentation",
        repository: "docs",
        points: 20,
      },
    ],
    totalTokens: 50,
    status: "fully_approved",
    managerApproval: {
      approved: true,
      approvedBy: "John Manager",
      approvedAt: new Date("2024-10-01T16:00:00Z"),
    },
    hrApproval: {
      approved: true,
      approvedBy: "Sarah HR",
      approvedAt: new Date("2024-10-02T10:00:00Z"),
      comment: "Approved for distribution",
    },
    createdAt: new Date("2024-09-25T11:20:00Z"),
    updatedAt: new Date("2024-10-02T10:00:00Z"),
  },
  {
    id: "reward-4",
    developerId: "4",
    developer: mockDevelopers[3],
    activities: [
      {
        type: "ticket",
        description: "Resolved production bug",
        ticketId: "TICK-125",
        points: 25,
      },
    ],
    totalTokens: 25,
    status: "distributed",
    managerApproval: {
      approved: true,
      approvedBy: "John Manager",
      approvedAt: new Date("2024-09-20T13:00:00Z"),
    },
    hrApproval: {
      approved: true,
      approvedBy: "Sarah HR",
      approvedAt: new Date("2024-09-21T09:00:00Z"),
    },
    createdAt: new Date("2024-09-18T15:30:00Z"),
    updatedAt: new Date("2024-09-22T10:00:00Z"),
  },
  {
    id: "reward-5",
    developerId: "1",
    developer: mockDevelopers[0],
    activities: [
      {
        type: "commit",
        description: "Added new API endpoints",
        repository: "backend-api",
        points: 40,
      },
    ],
    totalTokens: 40,
    status: "distributed",
    managerApproval: {
      approved: true,
      approvedBy: "John Manager",
      approvedAt: new Date("2024-09-15T11:00:00Z"),
    },
    hrApproval: {
      approved: true,
      approvedBy: "Sarah HR",
      approvedAt: new Date("2024-09-16T14:00:00Z"),
    },
    createdAt: new Date("2024-09-12T08:45:00Z"),
    updatedAt: new Date("2024-09-17T09:30:00Z"),
  },
];

export const getCurrentUser = () => ({
  id: "current-user",
  name: "John Manager",
  role: "manager" as "manager" | "developer" | "hr",
  email: "john.manager@company.com",
});

export const getCurrentDeveloper = () => mockDevelopers[0];
