"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "../services/auth.service";

export default function LogoutButton() {
  return (
    <Button variant={"outline"} onClick={signOut}>
      Logout
    </Button>
  );
}
