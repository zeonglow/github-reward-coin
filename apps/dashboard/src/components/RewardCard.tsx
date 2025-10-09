import { Reward } from "../types/reward";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Calendar,
  GitCommit,
  GitPullRequest,
  Ticket,
  Coins,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";
import React from "react";

interface RewardCardProps {
  reward: Reward;
  onApprove?: (
    rewardId: number,
    type: "manager" | "hr",
    comment?: string,
  ) => void;
  showActions?: boolean;
  userRole?: "manager" | "hr" | "developer";
}

export function RewardCard({
  reward,
  onApprove,
  showActions = false,
  userRole,
}: RewardCardProps) {
  const getStatusBadge = (status: Reward["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "manager_approved":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <User className="w-3 h-3 mr-1" />
            Manager Approved
          </Badge>
        );
      case "fully_approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Fully Approved
          </Badge>
        );
      case "distributed":
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            <Coins className="w-3 h-3 mr-1" />
            Distributed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "commit":
        return <GitCommit className="w-4 h-4" />;
      case "pr":
        return <GitPullRequest className="w-4 h-4" />;
      case "ticket":
        return <Ticket className="w-4 h-4" />;
      default:
        return <GitCommit className="w-4 h-4" />;
    }
  };

  const canApproveAsManager =
    userRole === "manager" && reward.status === "pending";
  const canApproveAsHR =
    userRole === "hr" && reward.status === "manager_approved";

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={reward.developer.avatar} />
              <AvatarFallback>
                {reward.developer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{reward.developer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {reward.developer.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(reward.status)}
            <div className="flex items-center mt-1 text-lg">
              <Coins className="w-5 h-5 mr-1 text-yellow-600" />
              <span>{reward.totalTokens} CKC</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm mb-2">Activities</h4>
            <div className="space-y-2">
              {reward.activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 bg-muted/50 rounded-md"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    {activity.repository && (
                      <p className="text-xs text-muted-foreground">
                        Repository: {activity.repository}
                      </p>
                    )}
                    {activity.ticketId && (
                      <p className="text-xs text-muted-foreground">
                        Ticket: {activity.ticketId}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            Created: {reward.createdAt.toLocaleDateString()}
          </div>

          {reward.managerApproval && (
            <div className="p-2 bg-blue-50 rounded-md">
              <p className="text-sm">
                ✅ Manager Approved by {reward.managerApproval.approvedBy}
              </p>
              <p className="text-xs text-muted-foreground">
                {reward.managerApproval.approvedAt.toLocaleString()}
              </p>
              {reward.managerApproval.comment && (
                <p className="text-xs italic mt-1">
                  "{reward.managerApproval.comment}"
                </p>
              )}
            </div>
          )}

          {reward.hrApproval && (
            <div className="p-2 bg-green-50 rounded-md">
              <p className="text-sm">
                ✅ HR Approved by {reward.hrApproval.approvedBy}
              </p>
              <p className="text-xs text-muted-foreground">
                {reward.hrApproval.approvedAt.toLocaleString()}
              </p>
              {reward.hrApproval.comment && (
                <p className="text-xs italic mt-1">
                  "{reward.hrApproval.comment}"
                </p>
              )}
            </div>
          )}

          {showActions && (canApproveAsManager || canApproveAsHR) && (
            <div className="pt-3 border-t">
              {canApproveAsManager && (
                <Button
                  onClick={() => onApprove?.(reward.id, "manager")}
                  className="w-full"
                >
                  Approve as Manager
                </Button>
              )}
              {canApproveAsHR && (
                <Button
                  onClick={() => onApprove?.(reward.id, "hr")}
                  className="w-full"
                >
                  Approve as HR Manager
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
