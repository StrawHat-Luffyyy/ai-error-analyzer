"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useTheme } from "next-themes";
import { chartColors } from "@/lib/chartTheme";

type Metrics = {
  totalErrors: number;
  avgResponseTime: string;
  topKeywords: string[];
  recentActivity: string[];
};
type CacheStats = {
  cacheHits: number;
  cacheMisses: number;
  avgCacheLatency: number;
  totalRequests: number;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCacheStats = async () => {
      try {
        const res = await api.get<CacheStats>("/cache");
        setCacheStats(res.data);
      } catch (err) {
        console.error("Cache stats error:", err);
      }
    };

    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.get("/metrics").then((res) => setMetrics(res.data));
  }, []);

  const colors = theme === "dark" ? chartColors.dark : chartColors.light;

  if (!metrics) return <p className="text-center mt-12">Loading metrics...</p>;

  const chartData = metrics.topKeywords.map((k: string) => ({
    name: k,
    count: 1,
  }));
  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Analyses" value={metrics.totalErrors} />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.avgResponseTime} ms`}
        />
        <MetricCard title="Top Keywords">
          <ul className="text-sm text-muted-foreground">
            {metrics.topKeywords.map((k: string, i: number) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </MetricCard>
      </div>
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Error Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-4xl mx-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Bar
                  dataKey="count"
                  fill={colors.bar}
                  radius={[6, 6, 0, 0]}
                  barSize={90}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-between">
          {cacheStats ? (
            <>
              {/* Donut Chart */}
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Cache Hits", value: cacheStats.cacheHits },
                        { name: "Cache Misses", value: cacheStats.cacheMisses },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      <Cell key="hit" fill="#4ade80" /> {/* green */}
                      <Cell key="miss" fill="#f87171" /> {/* red */}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Section */}
              <div className="mt-6 md:mt-0 md:w-1/2 space-y-2 text-sm">
                <p>
                  Cache Hits:{" "}
                  <span className="text-green-400 font-medium">
                    {cacheStats.cacheHits}
                  </span>
                </p>
                <p>
                  Cache Misses:{" "}
                  <span className="text-red-400 font-medium">
                    {cacheStats.cacheMisses}
                  </span>
                </p>
                <p>
                  Avg Cache Latency:{" "}
                  <span className="text-primary font-medium">
                    {cacheStats.avgCacheLatency} ms
                  </span>
                </p>
                <p>
                  Total Redis Operations:{" "}
                  <span className="text-primary font-medium">
                    {cacheStats.totalRequests}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              Loading cache stats...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics?.recentActivity?.length ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                metrics.recentActivity.map((log: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.input.slice(0, 60)}...
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    No recent activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  children,
}: {
  title: string;
  value?: string | number;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-border/50 hover:shadow-md transition">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children ? (
          children
        ) : (
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
