import { redirect } from "next/navigation";
import { isAuthenticated, getAuthUser } from "@/lib/server-utils";
import { getUserAccountStatus, isAdminUser } from "@/lib/account-status";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await isAuthenticated())) redirect("/login");

  // Check account status for non-admin users
  const user = await getAuthUser();
  if (user) {
    const isAdmin = await isAdminUser(user.id);
    if (!isAdmin) {
      const accountStatus = await getUserAccountStatus(user.id);

      if (accountStatus.status === "suspended") {
        redirect("/account/suspended");
      }

      if (accountStatus.status === "banned") {
        redirect("/account/banned");
      }
    }
  }

  return <>{children}</>;
}
