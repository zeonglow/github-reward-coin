import { useState } from 'react';
import { Reward } from '../types/reward';
import { RewardCard } from './RewardCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ClipboardList, Clock, CheckCircle, Coins, Users } from 'lucide-react';

interface ManagerDashboardProps {
  rewards: Reward[];
  onApprove: (rewardId: string, type: 'manager' | 'hr', comment?: string) => void;
  userRole: 'manager' | 'hr';
}

export function ManagerDashboard({ rewards, onApprove, userRole }: ManagerDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'manager_approved' | 'ready_to_distribute'>('all');

  const getFilteredRewards = () => {
    switch (filter) {
      case 'pending':
        return rewards.filter(r => r.status === 'pending');
      case 'manager_approved':
        return rewards.filter(r => r.status === 'manager_approved');
      case 'ready_to_distribute':
        return rewards.filter(r => r.status === 'fully_approved');
      default:
        return rewards.filter(r => r.status !== 'distributed');
    }
  };

  const filteredRewards = getFilteredRewards();

  const stats = {
    totalPending: rewards.filter(r => r.status === 'pending').length,
    managerApproved: rewards.filter(r => r.status === 'manager_approved').length,
    readyToDistribute: rewards.filter(r => r.status === 'fully_approved').length,
    totalTokensPending: rewards
      .filter(r => r.status !== 'distributed')
      .reduce((sum, r) => sum + r.totalTokens, 0),
    uniqueDevelopers: new Set(rewards.map(r => r.developerId)).size
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Manager Dashboard</h1>
          <p className="text-muted-foreground">Review and approve developer rewards</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {userRole === 'manager' ? 'Manager' : 'HR Manager'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalPending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Manager Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.managerApproved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ready to Distribute</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.readyToDistribute}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Tokens</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalTokensPending}</div>
            <p className="text-xs text-muted-foreground">CKC Tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Developers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.uniqueDevelopers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Pending</TabsTrigger>
          <TabsTrigger value="pending">Needs Approval</TabsTrigger>
          <TabsTrigger value="manager_approved">Manager Approved</TabsTrigger>
          <TabsTrigger value="ready_to_distribute">Ready to Distribute</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredRewards.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3>No rewards found</h3>
                  <p className="text-muted-foreground">No rewards match the current filter</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onApprove={onApprove}
                  showActions={true}
                  userRole={userRole}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}