import "@/app/globals.css";
import Footer from "@/components/blocks/footer";
import NavBar from "@/components/blocks/navbar";
import { isAuthenticated } from "@/lib/server-utils";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isAuthenticated()) redirect("/dashboard");

  return (
    <>
      <NavBar />
      <main className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-md">{children}</div>
      </main>
      <Footer />
    </>
  );
}