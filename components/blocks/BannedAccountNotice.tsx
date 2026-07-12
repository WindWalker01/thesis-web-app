"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function BannedAccountNotice() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Account Banned</CardTitle>
          <CardDescription className="text-base mt-2">
            Your account has been permanently banned.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              Your account has been permanently disabled for violating platform
              policies. This action is irreversible.
            </p>
          </div>

          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            <p>
              You can no longer access authenticated features of this platform.
              If you believe this decision was made in error, please contact the
              platform administrator to discuss your case.
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <p className="font-medium mb-1">Contact information:</p>
            <p>
              For questions about this action, please reach out to the
              platform administrator.
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