"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecentReport } from "../types";

type Props = {
  reports: RecentReport[];
};

const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  under_review: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  waiting_for_reporter: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  resolved: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

export function RecentReportsTable({ reports }: Props) {
  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No reports available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Reports</CardTitle>
        <p className="text-muted-foreground text-xs">Latest infringement reports</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Reporter</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-border border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {report.reporter.avatar ? (
                          <img
                            src={report.reporter.avatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {report.reporter.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm truncate max-w-[120px]">
                        {report.reporter.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm capitalize">{report.report_type.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={`${statusStyles[report.status] ?? ""} border-0 text-xs`}
                    >
                      {report.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/reports/${report.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}