import Link from "next/link";
import { BrainCircuitIcon } from "lucide-react";

function NavBar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-10">

          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <BrainCircuitIcon className="text-blue-500" size={28} />
              <span className="text-lg text-blue-500 font-bold tracking-tight">Art 
                <span className="text-orange-600">Forge
                  <span className="text-primary">Lab</span>
                </span>
              </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-blue-500">
              Dashboard
            </Link>

            <Link href="/gallery" className="hover:text-blue-500">
              Community
            </Link>

            <Link href="/plagarism-checker" className="hover:text-blue-500">
              Plagiarism Checker
            </Link>

            <Link href="/about" className="hover:text-blue-500">
              About
            </Link>

            <Link href="/faq" className="hover:text-blue-500">
              FAQ
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          <button className="text-sm font-medium hover:text-blue-500">
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