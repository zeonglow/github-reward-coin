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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, Clock } from "lucide-react";

const getHourlyData = () => {
  const data = [];
  let tokens = 0;
  for (let hour = 0; hour < 24; hour++) {
    tokens += Math.floor(Math.random() * 499) + 2;
    const time = hour.toString().padStart(2, "0") + ":00";
    data.push({ time, tokens });
  }
  return data;
};

const getDailyData = () => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const data = [];
  let tokens = 0;

  for (
    let date = new Date(lastMonth);
    date <= today;
    date.setDate(date.getDate() + 1)
  ) {
    tokens += Math.floor(Math.random() * 2000) + 200;
    const formattedDate = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });
    data.push({ date: formattedDate, tokens });
  }
  return data;
};

const getMonthlyData = () => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const data = [];
  let tokens = 0;

  const startMonth = new Date(today);
  startMonth.setFullYear(today.getFullYear() - 1);
  startMonth.setMonth(today.getMonth());
  startMonth.setDate(1);

  for (
    let date = new Date(startMonth);
    date <= today;
    date.setMonth(date.getMonth() + 1)
  ) {
    tokens += Math.floor(Math.random() * 10000) + 5000;
    const formattedDate = date.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
    data.push({ month: formattedDate, tokens });
  }
  return data;
};

type PerformanceProps = {
  supabase: any;
  liveStreamUser: string;
  setLiveStreamUser: (user: string) => void;
  developers: any[];
};

export const Performance = ({
  supabase,
  liveStreamUser,
  setLiveStreamUser,
  developers,
}: PerformanceProps) => {
  const [timePeriod, setTimePeriod] = useState<"hourly" | "daily" | "monthly">(
    "daily",
  );
  const [selectedDeveloper, setSelectedDeveloper] = useState(() => {
    return localStorage.getItem("liveStreamUser") || developers[0].id;
  });

  useEffect(() => {
    setLiveStreamUser(selectedDeveloper);
    localStorage.setItem("liveStreamUser", selectedDeveloper);
  }, [selectedDeveloper]);

  const getDeveloperName = (liveStreamUser) => {
    const developer =
      developers.find((d) => d.id === liveStreamUser) || developers[0];
    return developer?.name || developer?.github_username;
  };

  const getChartData = () => {
    switch (timePeriod) {
      case "hourly":
        return {
          data: getHourlyData(),
          xKey: "time",
          label: "Today's Progress (Cumulative)",
        };
      case "daily":
        return {
          data: getDailyData(),
          xKey: "date",
          label: "This Month's Progress (Cumulative)",
        };
      case "monthly":
        return {
          data: getMonthlyData(),
          xKey: "month",
          label: "Yearly Progress (Cumulative)",
        };
    }
  };

  const chartConfig = getChartData();
  const latestValue =
    chartConfig.data[chartConfig.data.length - 1]?.tokens || 0;
  const previousValue =
    chartConfig.data[chartConfig.data.length - 2]?.tokens || 0;
  const change = latestValue - previousValue;
  const changePercent =
    previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {getDeveloperName(liveStreamUser)}'s Kudos Performance
          </h1>
          <p className="text-gray-600">
            Track CodeKudos Coin (CKC) rewards over time
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedDeveloper}
            onValueChange={setSelectedDeveloper}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {developers.map((dev) => (
                <SelectItem key={dev.id} value={dev.id}>
                  {dev.name || dev.github_username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={timePeriod}
            onValueChange={(value: "hourly" | "daily" | "monthly") =>
              setTimePeriod(value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly View</SelectItem>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {latestValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Current Total CKC</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {timePeriod === "hourly" ? (
                <Clock className="w-5 h-5 text-green-500" />
              ) : (
                <Calendar className="w-5 h-5 text-green-500" />
              )}
              <div>
                <div className="text-2xl font-bold">
                  +{change.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {timePeriod === "hourly"
                    ? "Last Hour"
                    : timePeriod === "daily"
                      ? "Last Day"
                      : "Last Month"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">+{changePercent}%</div>
                <div className="text-sm text-gray-500">Growth Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{chartConfig.label}</CardTitle>
          <CardDescription>
            Your cumulative CKC rewards earned over{" "}
            {timePeriod === "hourly"
              ? "the past 24 hours"
              : timePeriod === "daily"
                ? "the past 30 days"
                : "the past year"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartConfig.data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey={chartConfig.xKey}
                stroke="#666"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#666" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: "#2563eb", r: 4 }}
                activeDot={{ r: 6 }}
                name="CKC Tokens"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Average per period:</span>
              <span className="font-bold">
                {(
                  chartConfig.data.reduce((sum, item: any) => {
                    const prevIndex = chartConfig.data.indexOf(item) - 1;
                    const prev =
                      prevIndex >= 0 ? chartConfig.data[prevIndex].tokens : 0;
                    return sum + (item.tokens - prev);
                  }, 0) / chartConfig.data.length
                ).toFixed(0)}{" "}
                CKC
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Peak rewards:</span>
              <span className="font-bold">
                {Math.max(
                  ...chartConfig.data.map((item, idx) => {
                    const prevTokens =
                      idx > 0 ? chartConfig.data[idx - 1].tokens : 0;
                    return item.tokens - prevTokens;
                  }),
                )}{" "}
                CKC
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Total earned:</span>
              <span className="font-bold text-blue-600">
                {latestValue.toLocaleString()} CKC
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                🎯 Your most productive{" "}
                {timePeriod === "hourly"
                  ? "hours are 3-5 PM"
                  : timePeriod === "daily"
                    ? "days are mid-week"
                    : "months are in Q2"}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm">
                📈 You're trending upward! Keep up the great work.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm">
                💡 Tip: Completing PRs earns more tokens than commits
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
