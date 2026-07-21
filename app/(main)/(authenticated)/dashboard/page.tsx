import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/server-utils";
import { isAdminUser } from "@/lib/account-status";
import DashboardPage from "@/features/(user)/dashboard/components/Page";

export default async function Page() {
  const user = await getAuthUser();
  if (user) {
    const isAdmin = await isAdminUser(user.id);
    if (isAdmin) redirect("/admin/dashboard");
  }

  return <DashboardPage />
}
