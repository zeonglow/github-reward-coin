import { Developer, Reward, DeveloperStats } from "../types/reward";
import { RewardCard } from "./RewardCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Coins,
  TrendingUp,
  Clock,
  CheckCircle,
  Copy,
  Trophy,
  Wallet,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
// @ts-expect-error - JSR import resolution issue
import { createClient } from "@jsr/supabase__supabase-js";
import * as supabaseInfo from "../utils/supabase/info";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  `https://${supabaseInfo.projectId}.supabase.co`,
  supabaseInfo.publicAnonKey,
);

interface DeveloperDashboardProps {
  githubId: string | null;
  githubUsername: string | null;
}

export function DeveloperDashboard({
  githubId,
  githubUsername,
}: DeveloperDashboardProps) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [developerRewards, setDeveloperRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wallet address from localStorage on mount
  useEffect(() => {
    const storedWalletAddress = localStorage.getItem("wallet_address");
    console.log(storedWalletAddress);
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
        console.log("Developer ID:", developerId);

        if (!walletAddress) {
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
        }

        // Fetch user's rewards with activities
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select(
            `
            *,
            activities:reward_activities(*)
          `,
          )
          .eq("developerId", developerId)
          .order("createdAt", { ascending: false });

        console.log("User rewards data:", rewardsData);

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
    .filter((r) => r.status === "distributed")
    .reduce((sum, r) => sum + r.totalTokens, 0);
  const pendingRewards = developerRewards
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.totalTokens, 0);

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied to clipboard");
  };

  const formatActivities = (activities: any[]) => {
    if (!activities || activities.length === 0) return "No activities";

    return activities
      .map((activity) => {
        const count = activity.count || 0;
        const type = activity.type || "activity";
        const plural = count > 1 ? "s" : "";
        return `${count} ${type}${plural}`;
      })
      .join(", ");
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
          {developerRewards.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3>No rewards yet</h3>
              <p className="text-muted-foreground">
                Your rewards will appear here once you start contributing
              </p>
            </div>
          ) : (
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
                    <TableCell className="font-medium">
                      {new Date(reward.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {reward.activities?.map((activity, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {activity.count} {activity.type}
                            {activity.count > 1 ? "s" : ""}
                          </Badge>
                        )) || (
                          <span className="text-muted-foreground text-sm">
                            No activities
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">
                      {reward.totalTokens} CKC
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reward.status === "distributed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {reward.status === "distributed"
                          ? "Completed"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {reward.status === "distributed"
                        ? new Date(reward.updatedAt).toLocaleDateString()
                        : new Date(reward.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
