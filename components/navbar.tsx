import Link from "next/link";
import { Fan } from "lucide-react";

function NavBar() {
  return (
    <nav className="flex flex-row justify-between items-center bg-amber-700">
      <div className="flex flex-row gap-2 items-center">
        <Fan color="black" size={48} />
        <div className="">Thesis Group 3</div>
        <div>
          <div className="flex flex-row gap-2">
            <Link href={"/dashboard"}>My Assets</Link>
            <Link href={"/plagarism-checker"}>Verify</Link>
            <Link href={"/gallery"}>Community</Link>
            {/* <Link>Admin</Link> */}
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 mr-4">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  );
}

export default NavBar;
