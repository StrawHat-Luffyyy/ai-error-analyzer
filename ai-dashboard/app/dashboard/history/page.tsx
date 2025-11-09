"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type HistoryItem = {
  _id: string;
  input: string;
  analysis: {
    summary: string;
    rootCause: string;
    suggestedFix: string;
  };
  createdAt: string;
  responseTime: number;
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (query = "") => {
    try {
      const res = await api.get(
        `/history?page=${page}&limit=10&search=${query}`
      );
      setData(res.data.results);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        await fetchHistory(search);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    loadHistory();
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);
    fetchHistory(search);
  };

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>History Search</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search bar */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search by keyword (e.g., TypeError)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell
                      className="max-w-[600px] truncate text-sm text-foreground/90"
                      title={item.analysis.summary}
                    >
                      {item.analysis.summary}
                    </TableCell>
                    <TableCell>{item.responseTime} ms</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
