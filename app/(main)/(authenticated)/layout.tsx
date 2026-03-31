import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/server-utils";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!await isAuthenticated()) redirect("/login");
  
  return <>{children}</>;
}
