import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Separator } from "./components/ui/separator";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import {
  CheckCircle,
  Clock,
  GitCommit,
  GitPullRequest,
  Ticket,
  Trophy,
  Wallet,
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  Target,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";
import { UnconnectedView } from "./components/UnconnectedView";
import { Reward } from "./types/reward";
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import { createClient } from "@jsr/supabase__supabase-js";
import * as supabaseInfo from "./utils/supabase/info";
import {faker} from '@faker-js/faker'

// Create a single supabase client for interacting with your database
const supabase = createClient(
  `https://${supabaseInfo.projectId}.supabase.co`,
  supabaseInfo.publicAnonKey,
);

const mockDeveloperRewards = [
  {
    id: 1,
    tokens: 850,
    status: "pending",
    period: "January 2024",
    activities: ["15 commits", "3 PRs", "8 tickets"],
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    tokens: 1200,
    status: "completed",
    period: "December 2023",
    activities: ["20 commits", "4 PRs", "10 tickets"],
    createdAt: "2023-12-15",
    distributedAt: "2023-12-28",
  },
  {
    id: 3,
    tokens: 950,
    status: "completed",
    period: "November 2023",
    activities: ["18 commits", "3 PRs", "7 tickets"],
    createdAt: "2023-11-15",
    distributedAt: "2023-11-30",
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "commit":
      return <GitCommit className="w-4 h-4" />;
    case "pr":
      return <GitPullRequest className="w-4 h-4" />;
    case "ticket":
      return <Ticket className="w-4 h-4" />;
    default:
      return null;
  }
};

const getStatusBadge = (reward: any) => {
  switch (reward.status) {
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
    case 'manager_approved':
      if (reward.managerApproval?.approved) {
        return <Badge variant="secondary" className="bg-yellow-500 text-white">HR Review</Badge>;
      } else {
        return <Badge variant="outline">Manager Review</Badge>;
      }
    case 'fully_approved':
      return (
        <Badge variant="default" className="bg-green-500">
          Fully Approved
        </Badge>
      );
    default:
      return null;
  }
};

const RewardCard = ({reward, onApprove, userRole}: any) => {
  const [approving, setApproving] = useState(false);
  const canApprove =
    (userRole === 'manager' && !reward.managerApproval?.approved) ||
    (userRole === 'hr' &&
      reward.managerApproval?.approved &&
      !reward.hrApproval?.approved);

  const handleApproval = async (rewardId: number, role: string) => {
    if (!canApprove) {
      return;
    }

    setApproving(true);
    await onApprove(reward.id, userRole)
    setApproving(false);
  }

  const walletAddress = reward.developer?.walletAddress;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {reward.developer.name || reward.developer.email}
              {getStatusBadge(reward)}
            </CardTitle>
            <CardDescription>
              Period: {reward.period} • Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="font-semibold text-2xl text-blue-600">
              {reward.totalTokens} CKC
            </div>
            <div className="text-sm text-gray-500">Total Reward</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reward.activities.map((activity: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
              >
                {getActivityIcon(activity.type)}
                <div>
                  <div className="font-medium">
                    {activity.count} {activity.type}s
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.points} points • {activity.repository}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {reward.managerApproval?.approved ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
                <span
                  className={
                    reward.managerApproval?.approved
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  Manager Approval
                </span>
              </div>
              <div className="flex items-center gap-1">
                {reward.hrApproval?.approved ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
                <span
                  className={
                    reward.hrApproval?.approved
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  HR Approval
                </span>
              </div>
            </div>

            {canApprove && (
              <Button
                onClick={() => handleApproval(reward.id, userRole)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {approving ? 'Approving...' : `
                  Approve (${userRole === 'manager' ? 'Manager' : 'HR'})
                `}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ManagerDashboard = () => {
  const [rewards, setRewards] = useState([]);
  const [userRole, setUserRole] = useState<"manager" | "hr">("manager");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    supabase
      .from("rewards")
      .select(
        `
        *,
        developer:users!developerId(id, name, email, walletAddress:wallet_address),
        activities:reward_activities(*)
      `,
      )
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching rewards:", error);
        } else {
          setRewards(data || []);
        }
      });
  }, []);

  const handleApprove = async (rewardId: number, role: string) => {
    const {data: [updatedReward]} = await supabase.from('rewards').update({
      [role === 'manager'
              ? 'managerApproval'
              : 'hrApproval']: {
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: faker.person.fullName()
      },
    }).eq('id', rewardId).select();

    setRewards((prevRewards) =>
        prevRewards.map((reward) =>
          reward.id === rewardId
            ? {
              ...reward,
              ...updatedReward,
            }
            : reward,
        )
    );
    toast.success(
      `Reward approved by ${role === "manager" ? "Manager" : "HR Manager"}`,
    );
  };

  const filteredRewards = rewards.filter((reward) => {
    if (filterStatus === "pending-manager") return ['manager_approved', 'pending'].includes(reward.status) && !reward.managerApproval?.approved;
    if (filterStatus === "pending-hr")
      return reward.status === 'manager_approved' && !reward.hrApproval?.approved;
    if (filterStatus === "approved") return reward.status === 'fully_approved';
    return true;
  });

  const stats = {
    totalPending: rewards.filter((r) => !['fully_approved', 'distributed'].includes(r.status)).length,
    totalTokens: rewards.reduce((sum, r) => sum + r.totalTokens, 0),
    activeDevelopers: new Set(rewards.map((r) => r.developerId)).size,
    completedThisMonth: rewards.filter((r) => r.status === 'fully_approved').length,
  };

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRewards = filteredRewards.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-gray-600">
            CodeKudos Coin (CKC) Reward Management
          </p>
        </div>
        <Select value={userRole} onValueChange={setUserRole}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="hr">HR Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalPending}</div>
                <div className="text-sm text-gray-500">Pending Approvals</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.totalTokens.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total CKC Tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.activeDevelopers}
                </div>
                <div className="text-sm text-gray-500">Active Developers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.completedThisMonth}
                </div>
                <div className="text-sm text-gray-500">
                  Completed This Month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rewards</SelectItem>
            <SelectItem value="pending-manager">Pending Manager</SelectItem>
            <SelectItem value="pending-hr">Pending HR</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rewards List */}
      <div>
        {filteredRewards.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                No rewards found for the selected filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {paginatedRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onApprove={handleApprove}
                userRole={userRole}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        size='default' />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                          size="icon"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        size='default'
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const DeveloperDashboard = ({
  githubId,
  githubUsername,
}: {
  githubId: string | null;
  githubUsername: string | null;
}) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [developerRewards, setDeveloperRewards] =
    useState(mockDeveloperRewards);
  const [isLoading, setIsLoading] = useState(false);

  // Load wallet address from localStorage on mount
  useEffect(() => {
    const storedWalletAddress = localStorage.getItem("wallet_address");
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
  }, []);

  // Fetch user-specific rewards and wallet address from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!githubId) return;

      setIsLoading(true);
      try {
        // Use the format `${githubUsername}${githubId}` as developerId
        const developerId = `${githubUsername}${githubId}`;

        // Fetch user's wallet address from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("wallet_address")
          .eq("id", developerId)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else if (userData?.wallet_address) {
          setWalletAddress(userData.wallet_address);
          // Store wallet address locally
          localStorage.setItem("wallet_address", userData.wallet_address);
        }

        // Fetch user's rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select(
            `
            *,
            activities:reward_activities(*)
          `,
          )
          .eq("developerId", developerId)
          .order("created_at", { ascending: false });

        if (rewardsError) {
          console.error("Error fetching user rewards:", rewardsError);
        } else {
          console.log("User rewards data:", rewardsData);
          setDeveloperRewards(rewardsData || []);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (githubId) {
      fetchUserData();
    }
  }, [githubId, githubUsername]);

  const totalRewards = developerRewards
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.tokens, 0);
  const pendingRewards = developerRewards
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.tokens, 0);

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Statistics cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Developer Dashboard</h1>
          <p className="text-gray-600">Your CodeKudos Coin (CKC) Rewards</p>
          {githubUsername && (
            <p className="text-sm text-blue-600">Welcome, @{githubUsername}!</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span className="font-mono">
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Loading wallet..."}
          </span>
          {walletAddress && (
            <Button variant="outline" size="sm" onClick={copyWallet}>
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {totalRewards.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total CKC Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {pendingRewards.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Pending CKC</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {developerRewards.length}
                </div>
                <div className="text-sm text-gray-500">Total Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards History */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards History</CardTitle>
          <CardDescription>
            Your complete reward history and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {developerRewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-medium">{reward.period}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {reward.activities.map((activity, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">
                    {reward.tokens} CKC
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reward.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {reward.status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {reward.status === "completed"
                      ? reward.distributedAt
                      : reward.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("manager");
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [githubId, setGithubId] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  // Load active tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (
      savedTab &&
      ["manager", "developer", "unconnected"].includes(savedTab)
    ) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // Check GitHub connection status on app load
  useEffect(() => {
    const checkGitHubStatus = async () => {
      try {
        // Check if user is already connected by calling the connect endpoint
        const serverUrl =
          (import.meta as any).env?.VITE_SERVER_URL || "http://localhost:54321";
        const response = await fetch(`${serverUrl}/functions/v1/connect`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // If we can access the endpoint, check for user data
          // For now, we'll use localStorage to track connection status
          const githubStatus = localStorage.getItem("github_connected");
          const storedGithubId = localStorage.getItem("github_id");
          const storedGithubUsername = localStorage.getItem("github_username");
          const connected = githubStatus === "true";

          setIsGitHubConnected(connected);
          setGithubId(storedGithubId);
          setGithubUsername(storedGithubUsername);

          // Set initial tab based on connection status
          if (connected) {
            if (activeTab === "unconnected") {
              setActiveTab("developer");
            }
          } else {
            if (activeTab === "developer") {
              setActiveTab("unconnected");
            }
          }
        }
      } catch (error) {
        console.log("GitHub status check failed:", error);
        setIsGitHubConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkGitHubStatus();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubConnected = urlParams.get("github_connected");
    const githubError = urlParams.get("github_error");

    if (githubConnected === "true") {
      // Extract GitHub ID and username from URL parameters
      const githubIdParam = urlParams.get("github_id");
      const githubUsernameParam = urlParams.get("github_username");

      setIsGitHubConnected(true);
      setGithubId(githubIdParam);
      setGithubUsername(githubUsernameParam);
      localStorage.setItem("github_connected", "true");
      if (githubIdParam) localStorage.setItem("github_id", githubIdParam);
      if (githubUsernameParam)
        localStorage.setItem("github_username", githubUsernameParam);
      setActiveTab("developer");
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // Show toast after a small delay to ensure UI has updated
      setTimeout(() => {
        toast.success(
          `GitHub account connected successfully! Welcome @${githubUsernameParam}`,
          { duration: 3000 },
        );
      }, 100);
    } else if (githubError) {
      toast.error(
        `GitHub connection failed: ${decodeURIComponent(githubError)}`,
        { duration: 5000 },
      );
      setIsGitHubConnected(false);
      localStorage.setItem("github_connected", "false");
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnectGithub = () => {
    // Redirect to server-side GitHub OAuth endpoint
    const serverUrl =
      (import.meta as any).env?.VITE_SERVER_URL || "http://localhost:54321";
    window.location.href = `${serverUrl}/functions/v1/connect/github`;
  };

  const handleDisconnectGithub = () => {
    // Clear GitHub connection status
    setIsGitHubConnected(false);
    setGithubId(null);
    setGithubUsername(null);
    localStorage.setItem("github_connected", "false");
    localStorage.removeItem("github_id");
    localStorage.removeItem("github_username");
    setActiveTab("unconnected");
    toast.success("GitHub account disconnected", {
      duration: 3000,
    });
  };

  // Show loading state while checking GitHub status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking GitHub connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              GitHub Reward Coin
            </h1>
            <div className="flex items-center gap-4">
              {isGitHubConnected ? (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    GitHub Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectGithub}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Not Connected
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConnectGithub}
                    className="bg-black-600 hover:bg-gray-700"
                  >
                    Connect GitHub
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className={`grid w-full max-w-2xl grid-cols-2`}>
              <TabsTrigger value="manager">Manager View</TabsTrigger>
              <TabsTrigger
                value={isGitHubConnected ? "developer" : "unconnected"}
              >
                Developer View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto">
        {activeTab === "manager" && <ManagerDashboard />}
        {activeTab === "developer" && (
          <DeveloperDashboard
            githubId={githubId}
            githubUsername={githubUsername}
          />
        )}
        {activeTab === "unconnected" && (
          <UnconnectedView onConnect={handleConnectGithub} />
        )}
      </div>
      <Toaster />
    </div>
  );
}
