"use server";

/**
 * Server action that returns only the public/branding settings.
 * No admin authentication required — these are safe for public consumption.
 */
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";
import { DEFAULT_SETTINGS } from "@/features/admin/settings/constants";

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

export type PublicSimilarityRiskThresholds = {
  /** Maps to admin `similarity_threshold` — red/critical boundary. */
  critical: number;
  /** Maps to admin `manual_review_threshold` — amber/moderate boundary. */
  moderate: number;
};

export async function getPublicSimilarityRiskThresholds(): Promise<PublicSimilarityRiskThresholds> {
  const settings = await getRuntimeSettings();

  const toFinite = (value: unknown, fallback: number): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  return {
    critical: toFinite(
      settings.similarity_threshold,
      Number(DEFAULT_SETTINGS.similarity_threshold),
    ),
    moderate: toFinite(
      settings.manual_review_threshold,
      Number(DEFAULT_SETTINGS.manual_review_threshold),
    ),
  };
}