import "@/app/globals.css";
import { isAuthenticated } from "@/lib/server-utils";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await isAuthenticated();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">{children}</div>
    </main>
  );
}