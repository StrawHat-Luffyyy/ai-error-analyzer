"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type ServiceHealth = {
  MongoDB: string;
  Redis: string;
  Sentry: string;
  Gemini: string;
};

export default function SystemStatus() {
  const [status, setStatus] = useState<ServiceHealth | null>(null);
  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.services))
      .catch(() => setStatus(null));
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        {status ? (
          <ul className="space-y-2 text-sm">
            {Object.entries(status).map(([key, value]) => (
              <li key={key} className="flex justify-between">
                <span className="font-medium text-foreground bg-background p-2 rounded-md w-1/2 text-center border border-gray-200 shadow-md hover:bg-gray-100 transition-colors duration-300 cursor-pointer hover:text-blue-500 hover:font-medium ">{key}</span>
                <span className="text-foreground bg-background p-2 rounded-md w-1/2 text-center border border-gray-200 shadow-md hover:bg-gray-100 transition-colors duration-300 cursor-pointer hover:text-blue-500 hover:font-medium ">{value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
