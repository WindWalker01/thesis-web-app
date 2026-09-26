"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { licenseIdentifierSchema } from "@/features/artwork-licensing/lib/artwork-license-schema";
import {
  getLicense,
  DEFAULT_LICENSE_ID,
  type LicenseIdentifier,
} from "@/features/artwork-licensing/lib/licenses";

type ChangeLicenseResult =
  | { success: true; message: string }
  | { success: false; message: string };

type RawArtworkLicenseRow = {
  id: string;
  owner_id: string;
  license_identifier: string | null;
};

/**
 * Change the usage license for an artwork owned by the current user.
 *
 * Only the artwork owner may change its license: the ownership filter is
 * applied on the row fetch and again on the update, so one artwork's license
 * can never affect another's. Returns an error when the user is not
 * authenticated, does not own the artwork, or provides an invalid license
 * identifier.
 */
export async function changeArtworkLicense(
  artId: string,
  licenseIdentifier: string,
): Promise<ChangeLicenseResult> {
  try {
    const parsed = licenseIdentifierSchema.safeParse(licenseIdentifier);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid license.",
      };
    }

    const nextId = parsed.data as LicenseIdentifier;
    const next = getLicense(nextId);

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Not authenticated." };
    }

    const { data: artwork, error: fetchError } = await supabase
      .from("registered_arts")
      .select("id, owner_id, license_identifier")
      .eq("id", artId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (fetchError || !artwork) {
      return {
        success: false,
        message: fetchError?.message ?? "Artwork not found.",
      };
    }

    const previousId = resolvePreviousLicense(
      (artwork as RawArtworkLicenseRow).license_identifier,
    );

    // No-op: the selected license is unchanged.
    if (previousId === nextId) {
      return {
        success: true,
        message: "The artwork license is unchanged.",
      };
    }

    const { error: updateError } = await supabase
      .from("registered_arts")
      .update({
        license_identifier: next.id,
        license_name: next.name,
        license_url: next.url,
        license_type: next.type,
        license_updated_at: new Date().toISOString(),
      })
      .eq("id", artId)
      .eq("owner_id", user.id);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Audit trail: record the previous -> new license transition.
    const { error: historyError } = await supabase
      .from("artwork_license_history")
      .insert({
        artwork_id: artId,
        previous_license: previousId,
        new_license: next.id,
        changed_by: user.id,
      });

    if (historyError) {
      console.error(
        "[Artwork Licensing] Failed to record license history:",
        historyError.message,
      );
      // The license change itself succeeded; a history failure is non-fatal.
    }

    return {
      success: true,
      message: `Artwork license updated to ${next.name}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update license.",
    };
  }
}

/** Normalize a stored identifier, defaulting to All Rights Reserved. */
function resolvePreviousLicense(
  identifier: string | null | undefined,
): LicenseIdentifier {
  if (typeof identifier === "string") {
    const match = getLicenseSafe(identifier);
    if (match) return match;
  }
  return DEFAULT_LICENSE_ID;
}

function getLicenseSafe(identifier: string): LicenseIdentifier | null {
  try {
    return getLicense(identifier).id;
  } catch {
    return null;
  }
}