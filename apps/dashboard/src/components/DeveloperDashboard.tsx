import { Developer, Reward, DeveloperStats } from '../types/reward';
import { RewardCard } from './RewardCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Coins, TrendingUp, Clock, CheckCircle, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import React from 'react';

interface DeveloperDashboardProps {
  developer: Developer;
  rewards: Reward[];
}

export function DeveloperDashboard({ developer, rewards }: DeveloperDashboardProps) {
  const developerRewards = rewards.filter(r => r.developerId === developer.id);

  const stats: DeveloperStats = {
    totalRewardsReceived: developerRewards
      .filter(r => r.status === 'distributed')
      .reduce((sum, r) => sum + r.totalTokens, 0),
    totalPendingRewards: developerRewards
      .filter(r => r.status !== 'distributed')
      .reduce((sum, r) => sum + r.totalTokens, 0),
    completedRewards: developerRewards.filter(r => r.status === 'distributed').length,
    thisMonthRewards: developerRewards
      .filter(r => {
        const rewardDate = new Date(r.createdAt);
        const now = new Date();
        return rewardDate.getMonth() === now.getMonth() &&
               rewardDate.getFullYear() === now.getFullYear() &&
               r.status === 'distributed';
      })
      .reduce((sum, r) => sum + r.totalTokens, 0)
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(developer.walletAddress);
    toast.success('Wallet address copied to clipboard');
  };

  const getRewardsByStatus = (status: Reward['status']) => {
    return developerRewards.filter(r => r.status === status);
  };

  const pendingRewards = developerRewards.filter(r => r.status !== 'distributed');
  const completedRewards = developerRewards.filter(r => r.status === 'distributed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Developer Dashboard</h1>
          <p className="text-muted-foreground">Track your CodeKudos Coin rewards</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">Developer</Badge>
      </div>

      {/* Developer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
              {developer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2>{developer.name}</h2>
              <p className="text-sm text-muted-foreground">{developer.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm">Wallet Address:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
              {developer.walletAddress}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyWalletAddress}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Rewards</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalRewardsReceived}</div>
            <p className="text-xs text-muted-foreground">CKC Tokens Received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Rewards</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalPendingRewards}</div>
            <p className="text-xs text-muted-foreground">CKC Tokens Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed Rewards</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.completedRewards}</div>
            <p className="text-xs text-muted-foreground">Total Rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.thisMonthRewards}</div>
            <p className="text-xs text-muted-foreground">CKC This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reward Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Rewards Earned vs Pending</span>
              <span>{stats.totalRewardsReceived} / {stats.totalRewardsReceived + stats.totalPendingRewards} CKC</span>
            </div>
            <Progress
              value={stats.totalRewardsReceived / (stats.totalRewardsReceived + stats.totalPendingRewards) * 100}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rewards List */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Rewards ({pendingRewards.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Rewards ({completedRewards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRewards.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3>No pending rewards</h3>
                  <p className="text-muted-foreground">Your pending rewards will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRewards.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3>No completed rewards</h3>
                  <p className="text-muted-foreground">Your completed rewards will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
