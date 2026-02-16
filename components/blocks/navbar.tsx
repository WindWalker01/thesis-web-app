import Link from "next/link";
import { Fan } from "lucide-react";

function NavBar() {
  return (
    <nav className="bg-background/95 border-border flex flex-row items-center justify-between border-b p-2 backdrop-blur">
      <div className="flex flex-row items-center gap-2">
        {/* Logo */}
        <Fan color="black" size={48} className="mx-2" />

        {/* Name */}
        <div className="">Thesis Group 3</div>

        {/* Links */}
        <div className="ml-6">
          <div className="flex flex-row gap-6">
            <Link href={"/dashboard"}>Dashboard</Link>
            <Link href={"/gallery"}>Community</Link>
            <Link href={"/plagarism-checker"}>Plagarism Checker</Link>
            <Link href={"/about"}>About</Link>
            <Link href={"/faq"}>FAQ</Link>
            {/* <Link>Admin</Link> */}
          </div>
        </div>
      </div>

      <div className="mr-4 flex flex-row gap-4">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  );
}

export default NavBar;
