// ✅ Option B — handle redirect in the LogoutButton component
"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "../services/auth.service";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Logout
    </Button>
  );
}