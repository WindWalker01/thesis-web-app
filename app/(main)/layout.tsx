import { headers } from "next/headers";
import Footer from "@/components/blocks/footer";
import NavBar from "@/components/blocks/navbar";
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ── Server-side Maintenance Mode Check ──
  // This runs only on (main) routes (dashboard, admin, gallery, etc.).
  // Auth routes ((auth) group) and recovery routes ((recovery) group) have
  // their own layouts that do NOT include this check, so login/register
  // pages remain reachable during maintenance. The middleware (proxy.ts)
  // is still the primary enforcement layer for non-main routes.
  //
  // We read the user's role from the x-user-role request header set by
  // middleware. This avoids cookie-propagation issues that occur when
  // the Server Component tries to call Supabase auth after a middleware
  // redirect chain (e.g. /login → /dashboard).
  const settings = await getRuntimeSettings();

  let isInMaintenance = settings.maintenance_mode;

  if (!isInMaintenance && settings.scheduled_maintenance) {
    const startStr = settings.scheduled_maintenance_start;
    const endStr = settings.scheduled_maintenance_end;
    if (startStr && endStr) {
      const now = new Date();
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (now >= start && now <= end) {
        isInMaintenance = true;
      }
    }
  }

  if (isInMaintenance) {
    const headersList = await headers();
    const role = headersList.get("x-user-role") ?? "anonymous";
    const isAdmin = role === "admin";

    if (!isAdmin) {
      const { default: MaintenancePage } = await import("@/app/maintenance/page");
      return <MaintenancePage />;
    }
  }

  return <>
    <NavBar />
    {children}
    <Footer />
  </>;
}
