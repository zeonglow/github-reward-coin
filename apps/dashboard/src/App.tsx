import React, {useEffect, useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import {Badge} from './components/ui/badge';
import {Button} from './components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import {Separator} from './components/ui/separator';
import {toast} from 'sonner@2.0.3';
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
} from 'lucide-react';
import {UnconnectedView} from './components/UnconnectedView';
import {Reward} from './types/reward';
import {createClient} from '@jsr/supabase__supabase-js'
import * as supabaseInfo from './utils/supabase/info'

// Create a single supabase client for interacting with your database
const supabase = createClient(`https://${supabaseInfo.projectId}.supabase.co`, supabaseInfo.publicAnonKey)

const mockDeveloperRewards = [
  {
    id: 1,
    tokens: 850,
    status: 'pending',
    period: 'January 2024',
    activities: ['15 commits', '3 PRs', '8 tickets'],
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    tokens: 1200,
    status: 'completed',
    period: 'December 2023',
    activities: ['20 commits', '4 PRs', '10 tickets'],
    createdAt: '2023-12-15',
    distributedAt: '2023-12-28',
  },
  {
    id: 3,
    tokens: 950,
    status: 'completed',
    period: 'November 2023',
    activities: ['18 commits', '3 PRs', '7 tickets'],
    createdAt: '2023-11-15',
    distributedAt: '2023-11-30',
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'commit':
      return <GitCommit className="w-4 h-4"/>;
    case 'pr':
      return <GitPullRequest className="w-4 h-4"/>;
    case 'ticket':
      return <Ticket className="w-4 h-4"/>;
    default:
      return null;
  }
};

const getStatusBadge = (reward: any) => {
  if (reward.hrApproval) {
    return (
      <Badge variant="default" className="bg-green-500">
        Approved
      </Badge>
    );
  } else if (reward.managerApproval) {
    return <Badge variant="secondary">HR Review</Badge>;
  } else {
    return <Badge variant="outline">Pending Manager</Badge>;
  }
};

const RewardCard = ({reward, onApprove, userRole}: any) => {
  const canApprove =
    (userRole === 'manager' && !reward.managerApproval) ||
    (userRole === 'hr' &&
      reward.managerApproval &&
      !reward.hrApproval);

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {reward.developer.name}
              {getStatusBadge(reward)}
            </CardTitle>
            <CardDescription>
              Period: {reward.period} • Wallet:{' '}
              {reward.developer.walletAddress}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="font-semibold text-2xl text-blue-600">
              {reward.totalTokens} CKC
            </div>
            <div className="text-sm text-gray-500">
              Total Reward
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reward.activities.map(
              (activity: any, index: number) => (
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
              ),
            )}
          </div>

          <Separator/>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {reward.managerApproval?.approved ? (
                  <CheckCircle className="w-4 h-4 text-green-500"/>
                ) : (
                  <Clock className="w-4 h-4 text-gray-400"/>
                )}
                <span
                  className={
                    reward.managerApproval?.approved
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }
                >
                  Manager Approval
                </span>
              </div>
              <div className="flex items-center gap-1">
                {reward.hrApproval?.approved ? (
                  <CheckCircle className="w-4 h-4 text-green-500"/>
                ) : (
                  <Clock className="w-4 h-4 text-gray-400"/>
                )}
                <span
                  className={
                    reward.hrApproval?.approved
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }
                >
                  HR Approval
                </span>
              </div>
            </div>

            {canApprove && (
              <Button
                onClick={() => onApprove(reward.id, userRole)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Approve (
                {userRole === 'manager' ? 'Manager' : 'HR'})
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
  const [userRole, setUserRole] = useState<'manager' | 'hr'>('manager');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    supabase.from('rewards')
      .select(`
        *,
        developer:users!developerId(id, name, email, walletAddress:wallet_address),
        activities:reward_activities(*)
      `)
      .then(({data, error}) => {
        if (error) {
          console.error('Error fetching rewards:', error);
        } else {
          console.log('DATA', data)
          setRewards(data || []);
        }
      });
  }, [])

  const handleApprove = (rewardId: number, role: string) => {
    setRewards((prevRewards) =>
      prevRewards.map((reward) =>
        reward.id === rewardId
          ? {
            ...reward,
            [role === 'manager'
              ? 'managerApproval'
              : 'hrApproval']: true,
          }
          : reward,
      ),
    );
    toast.success(
      `Reward approved by ${role === 'manager' ? 'Manager' : 'HR Manager'}`,
    );
  };

  const filteredRewards = rewards.filter((reward) => {
    if (filterStatus === 'pending-manager')
      return !reward.managerApproval;
    if (filterStatus === 'pending-hr')
      return reward.managerApproval && !reward.hrApproval;
    if (filterStatus === 'approved') return reward.hrApproval;
    return true;
  });

  const stats = {
    totalPending: rewards.filter((r) => !r.hrApproval).length,
    totalTokens: rewards.reduce(
      (sum, r) => sum + r.totalTokens,
      0,
    ),
    activeDevelopers: new Set(rewards.map((r) => r.developerId))
      .size,
    completedThisMonth: rewards.filter((r) => r.hrApproval)
      .length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Manager Dashboard
          </h1>
          <p className="text-gray-600">
            CodeKudos Coin (CKC) Reward Management
          </p>
        </div>
        <Select value={userRole} onValueChange={setUserRole}>
          <SelectTrigger className="w-40">
            <SelectValue/>
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
              <Clock className="w-5 h-5 text-orange-500"/>
              <div>
                <div className="text-2xl font-bold">
                  {stats.totalPending}
                </div>
                <div className="text-sm text-gray-500">
                  Pending Approvals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500"/>
              <div>
                <div className="text-2xl font-bold">
                  {stats.totalTokens.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Total CKC Tokens
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500"/>
              <div>
                <div className="text-2xl font-bold">
                  {stats.activeDevelopers}
                </div>
                <div className="text-sm text-gray-500">
                  Active Developers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500"/>
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
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="w-48">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rewards</SelectItem>
            <SelectItem value="pending-manager">
              Pending Manager
            </SelectItem>
            <SelectItem value="pending-hr">
              Pending HR
            </SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rewards List */}
      <div>
        {filteredRewards.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
              <p className="text-gray-500">
                No rewards found for the selected filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onApprove={handleApprove}
              userRole={userRole}
            />
          ))
        )}
      </div>
    </div>
  );
};

const DeveloperDashboard = () => {
  const [walletAddress] = useState('0x1234...5678');
  const developerRewards = mockDeveloperRewards;

  const totalRewards = developerRewards
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.tokens, 0);
  const pendingRewards = developerRewards
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.tokens, 0);

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied to clipboard');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Developer Dashboard
          </h1>
          <p className="text-gray-600">
            Your CodeKudos Coin (CKC) Rewards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5"/>
          <span className="font-mono">{walletAddress}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={copyWallet}
          >
            <Copy className="w-4 h-4"/>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500"/>
              <div>
                <div className="text-2xl font-bold">
                  {totalRewards.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Total CKC Earned
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500"/>
              <div>
                <div className="text-2xl font-bold">
                  {pendingRewards.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Pending CKC
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500"/>
              <div>
                <div className="text-2xl font-bold">
                  {developerRewards.length}
                </div>
                <div className="text-sm text-gray-500">
                  Total Rewards
                </div>
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
                  <TableCell className="font-medium">
                    {reward.period}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {reward.activities.map(
                        (activity, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {activity}
                          </Badge>
                        ),
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">
                    {reward.tokens} CKC
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reward.status === 'completed'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {reward.status === 'completed'
                        ? 'Completed'
                        : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {reward.status === 'completed'
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
  const [activeTab, setActiveTab] = useState('manager');

  const handleConnectGithub = () => {
    // Simulate GitHub connection
    setActiveTab('developer');
    toast.success('GitHub account connected successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white py-6">
        <div className="container mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="manager">
                Manager View
              </TabsTrigger>
              <TabsTrigger value="developer">
                Developer View
              </TabsTrigger>
              <TabsTrigger value="unconnected">
                Unconnected View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto">
        {activeTab === 'manager' && <ManagerDashboard/>}
        {activeTab === 'developer' && <DeveloperDashboard/>}
        {activeTab === 'unconnected' && (
          <UnconnectedView onConnect={handleConnectGithub}/>
        )}
      </div>
    </div>
  );
}
