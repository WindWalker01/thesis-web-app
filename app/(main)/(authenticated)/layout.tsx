import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/server-utils";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await isAuthenticated();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
