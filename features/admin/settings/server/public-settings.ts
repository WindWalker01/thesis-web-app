"use server";

/**
 * Server action that returns only the public/branding settings.
 * No admin authentication required — these are safe for public consumption.
 */
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";

export type PublicBrandingSettings = {
  platform_name: string;
  platform_description: string;
  platform_logo_url: string;
  support_email: string;
  footer_copyright: string;
};

export async function getPublicBrandingSettings(): Promise<PublicBrandingSettings> {
  const settings = await getRuntimeSettings();

  return {
    platform_name: settings.platform_name,
    platform_description: settings.platform_description,
    platform_logo_url: settings.platform_logo_url,
    support_email: settings.support_email,
    footer_copyright: settings.footer_copyright,
  };
}