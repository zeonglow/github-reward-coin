import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
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
  Users,
  DollarSign,
  Target,
  Hourglass,
  ChevronUp,
  ChevronDown,
  Coins,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";
import { UnconnectedView } from "./components/UnconnectedView";
import { DeveloperDashboard } from "./components/DeveloperDashboard";
import { LiveStream } from "./components/LiveStream";
import { Performance } from "./components/Performance";
import { Reward } from "./types/reward";
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import { createClient } from "@jsr/supabase__supabase-js";
import * as supabaseInfo from "./utils/supabase/info";
import { faker } from "@faker-js/faker";
import { getTimeAgo } from "./utils/time";
import { motion } from "motion/react";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  `https://${supabaseInfo.projectId}.supabase.co`,
  supabaseInfo.publicAnonKey,
);

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
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    case "manager_approved":
      if (reward.managerApproval?.approved) {
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            HR Review
          </Badge>
        );
      } else {
        return <Badge variant="outline">Manager Review</Badge>;
      }
    case "fully_approved":
      return (
        <Badge variant="default" className="bg-green-500">
          Fully Approved
        </Badge>
      );
    case "distributed":
      return (
        <Badge variant="default" className="bg-blue-500">
          Distributed
        </Badge>
      );
    default:
      return null;
  }
};

const RewardCard = ({
  reward,
  onApprove,
  userRole,
  setLiveStreamUser,
  setActiveTab,
}: any) => {
  const [approving, setApproving] = useState(false);
  const canApprove =
    (userRole === "manager" && !reward.managerApproval?.approved) ||
    (userRole === "hr" &&
      reward.managerApproval?.approved &&
      !reward.hrApproval?.approved);

  const handleApproval = async (rewardId: number, role: string) => {
    if (!canApprove) {
      return;
    }

    setApproving(true);
    await onApprove(reward.id, userRole);
    setApproving(false);
  };

  const walletAddress = reward.developer?.walletAddress;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <a
                onClick={() => {
                  setLiveStreamUser(reward.developer.id);
                  localStorage.setItem("liveStreamUser", reward.developer.id);
                  setActiveTab("performance");
                }}
                className="cursor-pointer hover:text-gray-400"
              >
                {reward.developer.name || reward.developer.github_username}
              </a>
              {getStatusBadge(reward)}
              <Clock className="w-4 h-4 mr-1" />
              <span>{getTimeAgo(reward.createdAt.toString())}</span>
            </CardTitle>
            <CardDescription>
              Period:{" "}
              {new Date(reward.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              • Wallet: {walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="font-semibold text-2xl text-blue-600">
              <Coins className="h-4 w-4 inline" />
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
                {approving
                  ? "Approving..."
                  : `
                  Approve (${userRole === "manager" ? "Manager" : "HR"})
                `}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

type ManagerDashboardProps = {
  liveStreamUser: string;
  setLiveStreamUser: (user: string) => void;
  setActiveTab: (tab: string) => void;
  developers: any[];
};

const ManagerDashboard = ({
  liveStreamUser,
  setLiveStreamUser,
  setActiveTab,
  developers,
}: ManagerDashboardProps) => {
  const [rewards, setRewards] = useState([]);
  const [userRole, setUserRole] = useState<"manager" | "hr">(() => {
    const saved = localStorage.getItem("manager_userRole");
    return (saved as "manager" | "hr") || "manager";
  });
  const [filterStatus, setFilterStatus] = useState(() => {
    return localStorage.getItem("manager_filterStatus") || "all";
  });
  const [filterDeveloperId, setFilterDeveloperId] = useState(() => {
    return localStorage.getItem("manager_filterDeveloperId") || "all";
  });
  const [order, setOrder] = useState(() => {
    return localStorage.getItem("manager_order") || "desc";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRewards, setTotalRewards] = useState(0);

  const [stats, setStats] = useState({
    totalPending: 0,
    totalTokens: 0,
    activeDevelopers: 0,
    completedThisMonth: 0,
  });
  const paginationResetRef = useRef(false);

  const itemsPerPage = 8;

  // Persist userRole to localStorage
  useEffect(() => {
    localStorage.setItem("manager_userRole", userRole);
  }, [userRole]);

  // Persist filterStatus to localStorage
  useEffect(() => {
    localStorage.setItem("manager_filterStatus", filterStatus);
  }, [filterStatus]);

  // Persist filterDeveloperId to localStorage
  useEffect(() => {
    localStorage.setItem("manager_filterDeveloperId", filterDeveloperId);

    if (filterDeveloperId !== "all") {
      setLiveStreamUser(filterDeveloperId);
      localStorage.setItem("liveStreamUser", filterDeveloperId);
    }
  }, [filterDeveloperId]);

  const fetchRewards = (
    from: number,
    to: number,
    order: "asc" | "desc" = "desc",
  ) => {
    let query = supabase
      .from("rewards")
      .select(
        `*,
        developer:users!developerId(id, github_username, name, email, walletAddress:wallet_address),
        activities:reward_activities(*)`,
        { count: "exact" },
      )
      .order("createdAt", {
        ascending: order === "asc",
      });

    if (filterStatus === "pending-manager") {
      query = query
        .in("status", ["pending", "manager_approved"])
        .filter("managerApproval->>approved", "eq", "false");
    }

    if (filterStatus === "pending-hr") {
      query = query
        .eq("status", "manager_approved")
        .filter("hrApproval->>approved", "eq", "false");
    }

    if (filterStatus === "approved") {
      query = query.eq("status", "fully_approved");
    }

    if (filterStatus === "distributed") {
      query = query.eq("status", "distributed");
    }

    if (filterDeveloperId !== "all") {
      query = query.eq("developerId", filterDeveloperId);
    }

    query.range(from, to).then(({ data, count, error }) => {
      if (error) {
        console.error("Error fetching rewards:", error);
        return;
      }

      setRewards(data || []);
      setTotalRewards(count);
    });
  };

  useEffect(() => {
    supabase
      .from("metrics")
      .select()
      .in("name", ["totalPending", "totalTokens", "activeDevelopers"])
      .then(({ data: metrics, error }) => {
        if (error) {
          console.error("Error fetching metrics:", error);
          return;
        }

        const newStats = metrics.reduce((accu, metric) => {
          accu[metric.name] = metric.value;
          return accu;
        }, {});

        setStats((prevState) => {
          return { ...prevState, ...newStats };
        });
      });

    // 1. Determine the start and end of the current month
    const now = new Date();

    // Start of the current month (e.g., October 1, 2025 00:00:00)
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    // Start of the next month (used for the less than filter)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfNextMonth = nextMonth.toISOString();

    // 2. Build the Supabase query
    supabase
      .from("rewards")
      .select("id", { count: "exact", head: true }) // Use head: true to only get the count
      .in("status", ["fully_approved", "distributed"]) // Filter by status
      .gte("createdAt", startOfMonth) // created_at >= start of the current month
      .lt("createdAt", startOfNextMonth) // created_at < start of the next month
      .then(({ count, error }) => {
        if (error) {
          console.error("Error fetching metrics:", error);
          return;
        }

        setStats((prevState) => {
          return { ...prevState, completedThisMonth: count || 0 };
        });
      });
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
    paginationResetRef.current = true;
    const from = 0;
    const to = itemsPerPage - 1;
    fetchRewards(from, to, order as "asc" | "desc");
    localStorage.setItem("manager_order", order);
  }, [filterStatus, filterDeveloperId]);

  useEffect(() => {
    if (paginationResetRef.current === true) {
      paginationResetRef.current = false;
      return;
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = currentPage * itemsPerPage - 1;
    fetchRewards(from, to, order as "asc" | "desc");
    localStorage.setItem("manager_order", order);
  }, [order, currentPage]);

  const sendTokenReward = async (
    rewardId: number,
    to: string,
    amount: string,
  ) => {
    try {
      // Check if user is already connected by calling the connect endpoint
      const serverUrl =
        (import.meta as any).env?.VITE_SERVER_URL || "http://localhost:54321";
      const url =
        serverUrl === "http://localhost:8000"
          ? new URL(`${serverUrl}/connect/reward`)
          : new URL(`${serverUrl}/functions/v1/connect/reward`);
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId, to, amount: String(amount) }),
      });

      if (response.ok) {
        // Handle successful response
        const { status } = await response.json();
        if (status === "success") {
          toast.success("Token reward sent successfully");
        }
      }
    } catch (error) {
      console.error("Error sending token reward:", error);
    }
  };

  const handleApprove = async (rewardId: number, role: string) => {
    const {
      data: [updatedReward],
    } = await supabase
      .from("rewards")
      .update({
        [role === "manager" ? "managerApproval" : "hrApproval"]: {
          approved: true,
          approvedAt: new Date().toISOString(),
          approvedBy: faker.person.fullName(),
        },
      })
      .eq("id", rewardId)
      .select();

    setRewards((prevRewards) =>
      prevRewards.map((reward) =>
        reward.id === rewardId
          ? {
              ...reward,
              ...updatedReward,
            }
          : reward,
      ),
    );
    toast.success(
      `Reward approved by ${role === "manager" ? "Manager" : "HR Manager"}`,
    );

    // if both approvals are done, update status to fully_approved
    const reward = { ...updatedReward };
    if (reward.managerApproval?.approved && reward.hrApproval?.approved) {
      // fully approve the reward
      await supabase
        .from("rewards")
        .update({ status: "fully_approved" })
        .eq("id", reward.id);

      // send token to developer's wallet
      await sendTokenReward(reward.id, reward.developerId, reward.totalTokens);
      toast.success("Tokens distributed to developer's wallet");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalRewards / itemsPerPage);

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
            <SelectItem value="distributed">Distributed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDeveloperId} onValueChange={setFilterDeveloperId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Developers</SelectItem>
            {developers.map((developer) => (
              <SelectItem key={developer.id} value={developer.id}>
                {developer.name || developer.github_username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex">
          <Button
            onClick={() => setOrder("asc")}
            variant={order === "asc" ? "default" : "outline"}
            className={`rounded-r-none ${
              order === "asc"
                ? "bg-blue-600 text-white"
                : "bg-white border-gray-300"
            }`}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setOrder("desc")}
            variant={order === "desc" ? "default" : "outline"}
            className={`rounded-l-none border-l-0 ${
              order === "desc"
                ? "bg-blue-600 text-white"
                : "bg-white border-gray-300"
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Rewards List */}
      <div>
        {rewards.length === 0 ? (
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
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onApprove={handleApprove}
                  userRole={userRole}
                  setLiveStreamUser={setLiveStreamUser}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                        size="default"
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
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
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                        size="default"
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

export default function App() {
  const [activeTab, setActiveTab] = useState("manager");
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [githubId, setGithubId] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [developers, setDevelopers] = useState([]);
  const [liveStreamUser, setLiveStreamUser] = useState(() => {
    return localStorage.getItem("liveStreamUser") || "";
  });

  // Load active tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (
      savedTab &&
      ["manager", "developer", "unconnected"].includes(savedTab)
    ) {
      setActiveTab(savedTab);
    }

    supabase
      .from("users")
      .select("id, name, github_username")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching users:", error);
        } else {
          setDevelopers(data || []);
        }
      });
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (activeTab !== "livestream") {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab]);

  // Check GitHub connection status on app load
  useEffect(() => {
    const checkGitHubStatus = async () => {
      try {
        // Check if user is already connected by calling the connect endpoint
        const serverUrl =
          (import.meta as any).env?.VITE_SERVER_URL || "http://localhost:54321";
        const url =
          serverUrl === "http://localhost:8000"
            ? new URL(`${serverUrl}/connect`)
            : new URL(`${serverUrl}/functions/v1/connect`);
        const response = await fetch(url.toString(), {
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
    console.log("Redirecting to GitHub OAuth at:", serverUrl);
    const url =
      serverUrl === "http://localhost:8000"
        ? new URL(`${serverUrl}/connect`)
        : new URL(`${serverUrl}/functions/v1/connect`);
    window.location.href = `${url}/github`;
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

  // Show skeleton layout while checking GitHub status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white py-6">
          <div className="container mx-auto">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="grid w-full grid-cols-2 max-w-2xl">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6">
          {/* Content skeleton based on active tab */}
          {activeTab === "manager" && (
            <div className="space-y-6">
              {/* Manager dashboard skeleton */}
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Stats cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
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
            </div>
          )}

          {activeTab === "developer" && (
            <div className="space-y-6">
              {/* Developer dashboard skeleton */}
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

              {/* Stats cards skeleton */}
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
            </div>
          )}

          {activeTab === "unconnected" && (
            <div className="space-y-6">
              {/* Unconnected view skeleton */}
              <div className="text-center space-y-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
                <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white py-6 header-container">
        <div className="container mx-auto header-container-inside">
          <img
            src="https://uvkwcralkuwqocgsmcap.supabase.co/storage/v1/object/public/images/codekudos.png"
            alt="GitHub Reward Coin"
            className="w-10 h-10 mr-4 logo"
          />
          <div className="header-content">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                CodeKudos Coin Reward
              </h1>
              <div className="flex items-center gap-4">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      <Hourglass className="w-3 h-3 mr-1" />
                      Checking GitHub status...
                    </Badge>
                  </div>
                ) : isGitHubConnected ? (
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
              <TabsList className={`grid w-full max-w-2xl grid-cols-4`}>
                <TabsTrigger value="manager">Manager View</TabsTrigger>
                <TabsTrigger
                  value={isGitHubConnected ? "developer" : "unconnected"}
                >
                  Developer View
                </TabsTrigger>
                <TabsTrigger value="livestream">Live Stream</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        {activeTab === "manager" && (
          <ManagerDashboard
            liveStreamUser={liveStreamUser}
            setLiveStreamUser={setLiveStreamUser}
            setActiveTab={setActiveTab}
            developers={developers}
          />
        )}
        {activeTab === "developer" && (
          <DeveloperDashboard
            supabase={supabase}
            githubId={githubId}
            githubUsername={githubUsername}
            liveStreamUser={liveStreamUser}
            setLiveStreamUser={setLiveStreamUser}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "unconnected" && (
          <UnconnectedView onConnect={handleConnectGithub} />
        )}
        {activeTab === "livestream" && (
          <LiveStream
            supabase={supabase}
            liveStreamUser={liveStreamUser}
            setLiveStreamUser={setLiveStreamUser}
            developers={developers}
          />
        )}
        {activeTab === "performance" && (
          <Performance
            supabase={supabase}
            liveStreamUser={liveStreamUser}
            setLiveStreamUser={setLiveStreamUser}
            developers={developers}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}
