"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type SuspensionInfo = {
  reason: string | null;
  suspended_until: string | null;
};

export function SuspendedAccountNotice() {
  const router = useRouter();
  const [suspensionInfo, setSuspensionInfo] = useState<SuspensionInfo>({
    reason: null,
    suspended_until: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuspensionInfo() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data } = await supabase
          .from("users")
          .select("suspension_reason, suspended_until")
          .eq("id", user.id)
          .single();

        if (data) {
          setSuspensionInfo({
            reason: data.suspension_reason,
            suspended_until: data.suspended_until,
          });
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchSuspensionInfo();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const expiryDate = suspensionInfo.suspended_until
    ? new Date(suspensionInfo.suspended_until).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg
              className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Account Suspended</CardTitle>
          <CardDescription className="text-base mt-2">
            Your account has been temporarily suspended.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              While your account is suspended, you cannot upload artwork, register
              artwork, create posts, vote, comment, or submit reports. You may
              still view your profile and browse public content.
            </p>
          </div>

          {suspensionInfo.reason && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Reason for suspension:</p>
              <p className="text-sm text-muted-foreground rounded-md bg-destructive/10 p-3 border border-destructive/20">
                {suspensionInfo.reason}
              </p>
            </div>
          )}

          {expiryDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Suspension expires:</p>
              <p className="text-sm text-muted-foreground">{expiryDate}</p>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <p>
              If you believe this suspension was made in error, please contact
              the platform administrator for assistance.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            className="w-full"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}