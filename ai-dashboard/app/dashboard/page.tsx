"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "next-themes";
import { chartColors } from "@/lib/chartTheme";

type Metrics = {
  totalErrors: number;
  avgResponseTime: string;
  topKeywords: string[];
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const { theme } = useTheme();

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
