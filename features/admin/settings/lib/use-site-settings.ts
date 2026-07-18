"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicBrandingSettings, type PublicBrandingSettings } from "@/features/admin/settings/server/public-settings";
import { DEFAULT_SETTINGS } from "@/features/admin/settings/constants";

/**
 * Client-side hook that provides typed access to public branding settings.
 *
 * Uses React Query with IndexedDB persistence (configured in the app's
 * ReactQueryClientProvider) so settings are cached across page navigations
 * without redundant server calls.
 *
 * Falls back to DEFAULT_SETTINGS values if the fetch fails or is pending.
 */
export function useSiteSettings() {
  const { data, isLoading, error } = useQuery<PublicBrandingSettings>({
    queryKey: ["site-settings", "branding"],
    queryFn: getPublicBrandingSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const fallback: PublicBrandingSettings = {
    platform_name: DEFAULT_SETTINGS.platform_name as string,
    platform_description: DEFAULT_SETTINGS.platform_description as string,
    platform_logo_url: DEFAULT_SETTINGS.platform_logo_url as string,
    support_email: DEFAULT_SETTINGS.support_email as string,
    footer_copyright: DEFAULT_SETTINGS.footer_copyright as string,
  };

  return {
    settings: data ?? fallback,
    isLoading,
    error,
  };
}