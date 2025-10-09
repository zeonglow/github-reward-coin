import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  GitCommit,
  CheckCircle,
  Shield,
  Coins,
  CheckCheck,
  Clock,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";

type LiveStreamProps = {
  supabase: any;
  developers: any[];
  liveStreamUser: string;
  setLiveStreamUser: (user: string) => void;
};

const getEventIcon = (type: string) => {
  switch (type) {
    case "commit":
      return <GitCommit className="w-5 h-5 text-blue-500" />;
    case "manager_approval":
      return <Shield className="w-5 h-5 text-purple-500" />;
    case "hr_approval":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "distribution":
      return <Coins className="w-5 h-5 text-yellow-500" />;
    case "completed":
      return <CheckCheck className="w-5 h-5 text-emerald-500" />;
    default:
      return <Activity className="w-5 h-5 text-gray-500" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case "commit":
      return "bg-blue-50 border-blue-200";
    case "manager_approval":
      return "bg-purple-50 border-purple-200";
    case "hr_approval":
      return "bg-green-50 border-green-200";
    case "distribution":
      return "bg-yellow-50 border-yellow-200";
    case "completed":
      return "bg-emerald-50 border-emerald-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const getActivityStatus = (events: any[]) => {
  if (events.length === 0) return { text: "No activity", progress: 0 };

  const lastEvent = events[events.length - 1];

  switch (lastEvent.type) {
    case "commit":
      return { text: `Working on ${lastEvent.repo}...`, progress: 20 };
    case "manager_approval":
      return { text: "Awaiting HR approval...", progress: 50 };
    case "hr_approval":
      return { text: "Processing token distribution...", progress: 75 };
    case "distribution":
      return { text: "Finalizing reward cycle...", progress: 90 };
    case "completed":
      return { text: "All rewards processed ✓", progress: 100 };
    default:
      return { text: "Processing...", progress: 10 };
  }
};

export function LiveStream({
  supabase,
  developers,
  liveStreamUser,
  setLiveStreamUser,
}: LiveStreamProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState("now");
  const [rewards, setRewards] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    let selectedUser = liveStreamUser;
    if (selectedUser === "") {
      selectedUser = developers[0].id;
      setLiveStreamUser(selectedUser);
      localStorage.setItem("liveStreamUser", selectedUser);
    }

    if (selectedUser !== "") {
      supabase
        .from("rewards")
        .select(
          `*,
          developer:users!developerId(id, github_username, name, email),
          activities:reward_activities(*)`,
        )
        .eq("developerId", selectedUser)
        .gt("createdAt", new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order("createdAt", {
          ascending: true,
        })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching rewards:", error);
          } else {
            console.log("rewards", rewards);
            setRewards(data || []);
          }
        });
    }
  }, [liveStreamUser]);

  // Mock events for each developer
  const mockEvents: Record<string, any[]> = {
    josualeonard: [
      {
        id: 1,
        type: "commit",
        message: "Fixed authentication bug in login module",
        repo: "main-app",
        timestamp: "2024-10-09T14:23:15Z",
        tokens: 10,
      },
      {
        id: 2,
        type: "commit",
        message: "Updated user profile UI",
        repo: "main-app",
        timestamp: "2024-10-09T14:45:32Z",
        tokens: 10,
      },
      {
        id: 3,
        type: "manager_approval",
        message: "Reward approved by Manager",
        timestamp: "2024-10-09T15:12:08Z",
        tokens: 120,
      },
      {
        id: 4,
        type: "hr_approval",
        message: "Reward approved by HR Manager",
        timestamp: "2024-10-09T15:34:21Z",
        tokens: 120,
      },
      {
        id: 5,
        type: "distribution",
        message: "120 CKC tokens distributed to wallet",
        timestamp: "2024-10-09T15:34:45Z",
        tokens: 120,
      },
      {
        id: 6,
        type: "completed",
        message: "Reward cycle completed",
        timestamp: "2024-10-09T15:35:00Z",
      },
    ],
    jed: [
      {
        id: 1,
        type: "commit",
        message: "Refactored API endpoints",
        repo: "api-service",
        timestamp: "2024-10-09T13:15:22Z",
        tokens: 10,
      },
      {
        id: 2,
        type: "commit",
        message: "Added unit tests for payment module",
        repo: "api-service",
        timestamp: "2024-10-09T13:42:10Z",
        tokens: 10,
      },
      {
        id: 3,
        type: "manager_approval",
        message: "Reward approved by Manager",
        timestamp: "2024-10-09T14:18:33Z",
        tokens: 150,
      },
    ],
    charlie: [
      {
        id: 1,
        type: "commit",
        message: "Updated documentation",
        repo: "docs",
        timestamp: "2024-10-09T12:08:45Z",
        tokens: 10,
      },
      {
        id: 2,
        type: "commit",
        message: "Fixed broken links in README",
        repo: "docs",
        timestamp: "2024-10-09T12:25:12Z",
        tokens: 10,
      },
      {
        id: 3,
        type: "manager_approval",
        message: "Reward approved by Manager",
        timestamp: "2024-10-09T13:05:28Z",
        tokens: 80,
      },
      {
        id: 4,
        type: "hr_approval",
        message: "Reward approved by HR Manager",
        timestamp: "2024-10-09T13:22:41Z",
        tokens: 80,
      },
      {
        id: 5,
        type: "distribution",
        message: "80 CKC tokens distributed to wallet",
        timestamp: "2024-10-09T13:23:05Z",
        tokens: 80,
      },
      {
        id: 6,
        type: "completed",
        message: "Reward cycle completed",
        timestamp: "2024-10-09T13:23:20Z",
      },
    ],
    diana: [
      {
        id: 1,
        type: "commit",
        message: "Implemented dark mode theme",
        repo: "mobile-app",
        timestamp: "2024-10-09T11:15:30Z",
        tokens: 10,
      },
    ],
    ethan: [
      {
        id: 1,
        type: "commit",
        message: "Optimized database queries",
        repo: "backend",
        timestamp: "2024-10-09T10:42:18Z",
        tokens: 10,
      },
      {
        id: 2,
        type: "commit",
        message: "Added caching layer",
        repo: "backend",
        timestamp: "2024-10-09T11:08:55Z",
        tokens: 10,
      },
    ],
  };

  const developer =
    developers.find((d) => d.id === liveStreamUser) || developers[0];

  // Filter events based on time range
  const getFilteredRewards = () => {
    const now = new Date();

    if (timeFilter === "now") {
      return rewards;
    }

    const minutesAgo = timeFilter === "lastMinute" ? 1 : 5;
    const cutoffTime = new Date(now.getTime() - minutesAgo * 60 * 1000);

    return rewards.filter((event) => {
      const eventTime = new Date(event.createdAt);
      return eventTime >= cutoffTime;
    });
  };

  const events = getFilteredRewards();
  const activityStatus = getActivityStatus(events);

  // Update progress bar with animation every second
  useEffect(() => {
    const targetProgress = activityStatus.progress;
    setProgress(targetProgress);

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [activityStatus.progress]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Live Stream</h1>
          <p className="text-gray-600">
            Real-time activity stream for developer rewards
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Filter Radio Group */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Start listening from:</Label>
            <RadioGroup
              value={timeFilter}
              onValueChange={setTimeFilter}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 radio-select">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="cursor-pointer">
                  Now
                </Label>
              </div>
              <div className="flex items-center space-x-2 radio-select">
                <RadioGroupItem value="lastMinute" id="lastMinute" />
                <Label htmlFor="lastMinute" className="cursor-pointer">
                  Last minute
                </Label>
              </div>
              <div className="flex items-center space-x-2 radio-select">
                <RadioGroupItem value="last5Minutes" id="last5Minutes" />
                <Label htmlFor="last5Minutes" className="cursor-pointer">
                  Last 5 minutes
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Developer Select */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Developer:</Label>
            <Select value={liveStreamUser} onValueChange={setLiveStreamUser}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={"none0"} value={"none"}>
                  Select a developer
                </SelectItem>
                {developers.map((dev) => (
                  <SelectItem key={dev.id} value={dev.id}>
                    {dev.name || dev.github_username}
                    {dev.name ? ` (${dev.github_username})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Current Activity Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Current Activity: {developer.name || developer.github_username}
              </CardTitle>
              <CardDescription>
                {developer.github} • Last updated:{" "}
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <span className="live-red-dot"></span>
              <span>Live</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{activityStatus.text}</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="relative">
              <Progress
                value={progress}
                className="h-3 transition-all duration-1000"
              />
              {progress > 0 && progress < 100 && (
                <motion.div
                  className="absolute inset-0 h-3 rounded-full overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {events.length > 0 && (
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {events.filter((e) => e.type === "commit").length}
                </div>
                <div className="text-sm text-gray-500">Commits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {events.filter((e) => e.type === "manager_approval").length}
                </div>
                <div className="text-sm text-gray-500">Manager Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {events.filter((e) => e.type === "hr_approval").length}
                </div>
                <div className="text-sm text-gray-500">HR Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {events
                    .filter((e) => e.type === "distribution")
                    .reduce((sum, e) => sum + (e.tokens || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">CKC Distributed</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Stream */}
      <Card>
        <CardHeader>
          <CardTitle>Event Stream</CardTitle>
          <CardDescription>
            Detailed timeline of all activities and approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No events recorded yet</p>
              <p className="text-sm">
                Waiting for activity from{" "}
                {developer.name || developer.github_username}...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getEventIcon(event.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{event.message}</p>
                          {event.repo && (
                            <p className="text-sm text-gray-600 mt-1">
                              Repository:{" "}
                              <code className="bg-white px-1.5 py-0.5 rounded">
                                {event.repo}
                              </code>
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium text-gray-700">
                            {formatTimestamp(event.timestamp)}
                          </div>
                          {event.tokens && (
                            <Badge variant="secondary" className="mt-1">
                              +{event.tokens} CKC
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
