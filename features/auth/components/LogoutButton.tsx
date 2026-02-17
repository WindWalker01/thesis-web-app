"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "../services/auth.service";

function LogoutButton() {
  return (
    <Button variant={"outline"} onClick={signOut}>
      Logout
    </Button>
  );
}

export default LogoutButton;
