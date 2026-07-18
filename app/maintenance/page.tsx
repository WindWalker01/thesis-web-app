/**
 * Maintenance Page — shown to all non-admin users when maintenance mode is active.
 *
 * This is a Server Component that reads the current maintenance_message from
 * system_settings and renders a clean, branded page.
 */
import { redirect } from "next/navigation";
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";
import { MaintenanceCountdown } from "@/components/blocks/MaintenanceCountdown";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await getRuntimeSettings();

  // ── Redirect to home if maintenance mode is not active ──
  // Prevents users from accessing /maintenance by typing the URL
  // when maintenance is not enabled (manually or via scheduled window).
  const isInMaintenance = settings.maintenance_mode ||
    (settings.scheduled_maintenance &&
     settings.scheduled_maintenance_start &&
     settings.scheduled_maintenance_end &&
     new Date() >= new Date(settings.scheduled_maintenance_start) &&
     new Date() <= new Date(settings.scheduled_maintenance_end));

  if (!isInMaintenance) {
    redirect("/");
  }

  const message = settings.maintenance_message;
  const displayCountdown = settings.display_countdown;
  const allowAdminLogin = settings.allow_admin_login_during_maintenance;
  const scheduledEnd = settings.scheduled_maintenance_end;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src={settings.platform_logo_url}
            alt={settings.platform_name}
            className="h-16 w-auto"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <svg
            className="h-16 w-16 text-muted-foreground/40"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {settings.platform_name}
          </h1>
          <h2 className="text-xl font-semibold text-muted-foreground">
            Currently Under Maintenance
          </h2>
        </div>

        {/* Message */}
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm leading-relaxed text-card-foreground">
            {message}
          </p>
        </div>

        {/* Live Countdown Timer */}
        {displayCountdown && scheduledEnd && (
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <MaintenanceCountdown endTime={scheduledEnd} />
          </div>
        )}

        {/* Admin Login Link */}
        {allowAdminLogin && (
          <div className="pt-4">
            <a
              href="/login"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Administrator? Log in here
            </a>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-muted-foreground/50 pt-8">
          {settings.footer_copyright}
        </p>
      </div>
    </div>
  );
}
