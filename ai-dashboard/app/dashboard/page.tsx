"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Metrics = {
  averageResponseTime: number;
  totalErrors: number;
  topKeywords: string[];
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    api.get("/metrics").then((res) => setMetrics(res.data));
  }, []);
  if (!metrics) {
    return <p className="text center mt-8">Loading metrics...</p>;
  }
  return (
    <main className="p-6 grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Analyses</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {metrics.totalErrors}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {metrics.averageResponseTime}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topKeywords.map((k: string, i: number) => (
              <div key={i} className="text-sm">
                {k}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Error Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={metrics.topKeywords.map((k) => ({ name: k, count: 1 }))}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </main>
  );
}
