import Link from "next/link";
import { ShieldCheck } from "lucide-react";

function NavBar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-10">

          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={28} />
            <span className="text-lg font-bold tracking-tight">
              ArtForgeLab
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>

            <Link href="/gallery" className="hover:text-primary transition-colors">
              Community
            </Link>

            <Link href="/plagarism-checker" className="hover:text-primary transition-colors">
              Plagiarism Checker
            </Link>

            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>

            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          <button className="text-sm font-medium hover:text-primary transition-colors">
            Login
          </button>

          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
            Register
          </button>

        </div>

      </div>
    </nav>
  );
}

export default NavBar;