import Link from "next/link";
import { Fan } from "lucide-react";
import { isAuthenticated } from "@/lib/server-utils";
import LogoutButton from "@/features/(user)/auth/components/LogoutButton";
import UserMenu from "./UserMenu";

async function NavBar() {
  const authed = await isAuthenticated();

  return (
    <nav className="border-border flex flex-row items-center justify-between border-b p-2 backdrop-blur bg-white dark:bg-[#0e1113]">
      <div className="flex flex-row items-center gap-2">
        <Fan color="black" size={48} className="mx-2" />
        <div>Thesis Group 3</div>

        <div className="ml-6">
          <div className="flex flex-row gap-6">
            <Link href={"/dashboard"}>Dashboard</Link>
            <Link href={"/gallery"}>Community</Link>
            <Link href={"/plagarism-checker"}>Plagarism Checker</Link>
            <Link href={"/about"}>About</Link>
            <Link href={"/faq"}>FAQ</Link>
          </div>
        </div>
      </div>

      <div className="mr-4 flex flex-row gap-2 items-center">
        {authed ? (
          <LogoutButton />
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm rounded-3xl cursor-pointer bg-blue-600 px-4 py-2 hover:bg-blue-700 text-white"
            >
              Log In
            </Link>

            <UserMenu loginHref="/login" registerHref="/register" />
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;