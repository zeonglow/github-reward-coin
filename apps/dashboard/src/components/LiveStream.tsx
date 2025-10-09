import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { getTimeAgo } from "../utils/time";

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

export function LiveStream({
  supabase,
  developers,
  liveStreamUser,
  setLiveStreamUser,
}: LiveStreamProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rewards, setRewards] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  // Debouncing and duplicate prevention
  const processedEvents = useRef(new Set());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdates = useRef<any[]>([]);
  const liveEventsRef = useRef([]);
  const rewardsRef = useRef([]);

  // Debounced update function to prevent rapid updates
  const debouncedUpdate = useCallback((newEvent: any) => {
    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Add to pending updates
    pendingUpdates.current.push(newEvent);

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      if (pendingUpdates.current.length > 0) {
        // Process only the latest event to avoid duplicates
        const latestEvent =
          pendingUpdates.current[pendingUpdates.current.length - 1];

        setLiveEvents((prevEvents) => {
          // Check if this event was already processed
          const eventKey = `${latestEvent.id}-${latestEvent.time}`;
          if (processedEvents.current.has(eventKey)) {
            return prevEvents;
          }

          // Mark as processed
          processedEvents.current.add(eventKey);

          // Add to events
          const newLiveEvents = [...prevEvents];
          newLiveEvents.unshift(latestEvent);
          // Keep only last 50 events to prevent memory issues
          newLiveEvents.slice(0, 50);

          liveEventsRef.current = newLiveEvents;

          return newLiveEvents;
        });

        // Clear pending updates
        pendingUpdates.current = [];
      }
    }, 500); // 500ms debounce
  }, []);

  useEffect(() => {
    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rewards",
        },
        (payload) => {
          if (
            (payload.eventType === "UPDATE" ||
              payload.eventType === "INSERT") &&
            payload.new?.developerId === liveStreamUser
          ) {
            const lastLiveEvent = liveEventsRef.current[0];

            const statusChanged =
              lastLiveEvent && lastLiveEvent?.status !== payload.new?.status;
            const managerApproval =
              lastLiveEvent &&
              lastLiveEvent?.managerApproval?.approved === false &&
              payload.new?.managerApproval?.approved === true;

            let message =
              payload.new.createdAt === payload.new.updatedAt
                ? "Commit made"
                : "";
            let type = "commit";
            if (statusChanged) {
              message = "Status changed to " + payload.new?.status;
              if (payload.new?.status === "fully_approved") {
                type = "distribution";
                message = `HR approved this commit. ${payload.new?.totalTokens} CKC being distributed to your wallet!`;
              }
              if (payload.new?.status === "distributed") {
                type = "completed";
                message = "Reward cycle completed!";
              }
            }
            if (managerApproval) {
              message = "Manager approved this commit";
              type = "manager_approval";
            }
            if (
              !statusChanged &&
              !managerApproval &&
              payload.new?.createdAt !== payload.new?.updatedAt
            ) {
              message = "Reward updated";
            }

            let repo = "";
            const activities = rewardsRef.current.find(
              (r) => r.id === payload.new?.id,
            )?.activities;
            if (activities?.length > 0) {
              repo = activities?.[0]?.repository;
            }

            // Create the event object
            const newEvent = {
              id: payload.commit_timestamp,
              type,
              message,
              repo,
              time: payload.new?.updatedAt,
              tokens: 10,
              status: payload.new?.status,
              managerApproval: payload.new?.managerApproval,
              hrApproval: payload.new?.hrApproval,
            };

            // Use debounced update instead of direct state update
            debouncedUpdate(newEvent);
          }
        },
      )
      .subscribe();

    // Cleanup function
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [debouncedUpdate]);

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
        .gt(
          "createdAt",
          new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        )
        .order("createdAt", {
          ascending: false,
        })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching rewards:", error);
          } else {
            rewardsRef.current = data || [];

            const liveEvents = data.map((r) => {
              let type = "commit";
              let message = "Commit made";
              if (r.status === "manager_approved") {
                type = "manager_approval";
                message = "Manager approved this commit";
              }
              if (r.status === "fully_approved") {
                type = "distribution";
                message = `HR approved this commit. ${r.totalTokens} CKC being distributed to your wallet!`;
              }
              if (r.status === "distributed") {
                type = "completed";
                message = "Reward cycle completed!";
              }
              if (r.status === "pending" && r.activities?.length > 0) {
                message =
                  "Commit made: " +
                  r.activities?.map((a) => a.description).join(", ");
              }
              return {
                id: r.id,
                type,
                message,
                repo: r.activities?.[0]?.repository || "",
                time: r.updatedAt,
                tokens: r.totalTokens,
                status: r.status,
                managerApproval: r.managerApproval,
                hrApproval: r.hrApproval,
              };
            });
            // Set initial events
            setLiveEvents(liveEvents);
            liveEventsRef.current = liveEvents;
          }
        });
    }
  }, [liveStreamUser]);

  const developer =
    developers.find((d) => d.id === liveStreamUser) || developers[0];

  // Update progress bar with animation every second
  useEffect(() => {
    const initialNow = new Date();
    const nextHour = new Date(initialNow.getTime() + 6 * 1000);

    // Update current time every second
    const timeInterval = setInterval(() => {
      const dateNow = new Date();
      setCurrentTime(dateNow);
      const progressValue =
        1 -
        (dateNow.getTime() - nextHour.getTime()) /
          (initialNow.getTime() - nextHour.getTime());

      if (progressValue < 100) {
        setProgress(progressValue > 100 ? 100 : progressValue);
      }
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

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
                {developer.github_username} •{" "}
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
              <span className="font-medium">Listening...</span>
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

          {liveEvents.length === 0 ? (
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
              {liveEvents.map((event, index) => (
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
                          {event.repo ? (
                            <p className="text-sm text-gray-600 mt-1">
                              Repository:{" "}
                              <code className="bg-white px-1.5 py-0.5 rounded">
                                {event.repo}
                              </code>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">
                              No activities
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium text-gray-700">
                            {getTimeAgo(event.time)}
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
