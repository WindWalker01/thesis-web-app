"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/users">Manage Users</Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/artworks">Manage Artworks</Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/reports">View Reports</Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/admin/settings">Settings</Link>
        </Button>
      </CardContent>
    </Card>
  );
}