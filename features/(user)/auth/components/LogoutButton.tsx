// features/(user)/auth/components/LogoutButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signOut } from "../server/auth";
import { clearQueryCache } from "@/providers/react-query-provider";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingOut(true);

    try {
      await clearQueryCache();
      await signOut();
    } catch (err) {
      console.error("Failed to log out", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <form onSubmit={handleLogout}>
      <Button
        type="submit"
        variant="outline"
        disabled={isLoggingOut}
        className="flex items-center justify-center gap-2 transition-all duration-200"
      >
        {isLoggingOut ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Logging out…</>
        ) : (
          "Logout"
        )}
      </Button>
    </form>
  );
}