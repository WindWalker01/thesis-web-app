/**
 * Artwork licensing catalog.
 *
 * Single source of truth for the supported usage licenses. This is a license
 * *selection and documentation* mechanism: it records the usage terms the
 * artwork creator selected. It does not determine legal copyright ownership,
 * register copyright, grant rights, or provide legal advice.
 */

export type LicenseType = "all_rights_reserved" | "creative_commons";

export const LICENSE_IDS = [
  "all-rights-reserved",
  "cc-by",
  "cc-by-sa",
  "cc-by-nc",
  "cc-by-nc-sa",
  "cc-by-nd",
  "cc-by-nc-nd",
] as const;

export type LicenseIdentifier = (typeof LICENSE_IDS)[number];

export type LicensePermissionKey =
  | "share"
  | "adapt"
  | "commercial"
  | "attribution";

export type LicensePermissions = {
  share: boolean;
  adapt: boolean;
  commercial: boolean;
  attribution: boolean;
  permissionRequired: boolean;
};

export type LicensePermissionLabel = {
  key: LicensePermissionKey;
  label: string;
  allowed: boolean;
  note: string;
};

export interface ArtworkLicense {
  id: LicenseIdentifier;
  name: string;
  shortHandle: string;
  url: string | null;
  type: LicenseType;
  description: string;
  permissions: LicensePermissions;
}

export const LICENSE_DISCLAIMER =
  "License information represents the usage terms selected by the artwork creator. It does not constitute legal advice or replace a formal licensing agreement where one is required.";

export const DEFAULT_LICENSE_ID: LicenseIdentifier = "all-rights-reserved";

export const LICENSES: ArtworkLicense[] = [
  {
    id: "all-rights-reserved",
    name: "All Rights Reserved",
    shortHandle: "All Rights Reserved",
    url: null,
    type: "all_rights_reserved",
    description:
      "You retain all rights. Other people must ask your permission before using, copying, or modifying the artwork.",
    permissions: {
      share: false,
      adapt: false,
      commercial: false,
      attribution: true,
      permissionRequired: true,
    },
  },
  {
    id: "cc-by",
    name: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    shortHandle: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/",
    type: "creative_commons",
    description:
      "Anyone can share and adapt the artwork for any purpose (even commercial), as long as they credit you.",
    permissions: {
      share: true,
      adapt: true,
      commercial: true,
      attribution: true,
      permissionRequired: false,
    },
  },
  {
    id: "cc-by-sa",
    name: "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
    shortHandle: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
    type: "creative_commons",
    description:
      "Anyone can share and adapt the artwork, even commercially, as long as they credit you and share new versions under the same terms.",
    permissions: {
      share: true,
      adapt: true,
      commercial: true,
      attribution: true,
      permissionRequired: false,
    },
  },
  {
    id: "cc-by-nc",
    name: "Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)",
    shortHandle: "CC BY-NC 4.0",
    url: "https://creativecommons.org/licenses/by-nc/4.0/",
    type: "creative_commons",
    description:
      "Anyone can share and adapt the artwork for non-commercial purposes, as long as they credit you.",
    permissions: {
      share: true,
      adapt: true,
      commercial: false,
      attribution: true,
      permissionRequired: false,
    },
  },
  {
    id: "cc-by-nc-sa",
    name: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)",
    shortHandle: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    type: "creative_commons",
    description:
      "Anyone can share and adapt the artwork for non-commercial purposes, as long as they credit you and share new versions under the same terms.",
    permissions: {
      share: true,
      adapt: true,
      commercial: false,
      attribution: true,
      permissionRequired: false,
    },
  },
  {
    id: "cc-by-nd",
    name: "Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)",
    shortHandle: "CC BY-ND 4.0",
    url: "https://creativecommons.org/licenses/by-nd/4.0/",
    type: "creative_commons",
    description:
      "Anyone can share the artwork (even commercially) as long as they credit you and do not modify or remix it.",
    permissions: {
      share: true,
      adapt: false,
      commercial: true,
      attribution: true,
      permissionRequired: false,
    },
  },
  {
    id: "cc-by-nc-nd",
    name: "Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)",
    shortHandle: "CC BY-NC-ND 4.0",
    url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    type: "creative_commons",
    description:
      "Anyone can share the artwork for non-commercial purposes as long as they credit you and do not modify or remix it.",
    permissions: {
      share: true,
      adapt: false,
      commercial: false,
      attribution: true,
      permissionRequired: false,
    },
  },
]
const LICENSE_BY_ID: ReadonlyMap<string, ArtworkLicense> = new Map(
  LICENSES.map((license) => [license.id, license]),
);

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function findLicense(
  identifier: string | null | undefined,
): ArtworkLicense | null {
  if (typeof identifier !== "string") return null;
  return LICENSE_BY_ID.get(normalizeIdentifier(identifier)) ?? null;
}

export function resolveLicense(
  identifier: string | null | undefined,
): ArtworkLicense {
  return findLicense(identifier) ?? LICENSE_BY_ID.get(DEFAULT_LICENSE_ID)!;
}

export function getLicense(identifier: string): ArtworkLicense {
  const license = findLicense(identifier);
  if (!license) {
    throw new Error(`Unsupported license identifier: ${identifier}`);
  }
  return license;
}

export function isLicenseIdentifier(
  value: unknown,
): value is LicenseIdentifier {
  return (
    typeof value === "string" &&
    LICENSE_IDS.some((id) => id === normalizeIdentifier(value))
  );
}

export function permissionChecklist(
  license: ArtworkLicense,
): LicensePermissionLabel[] {
  const p = license.permissions;
  return [
    {
      key: "share",
      label: "Share",
      allowed: p.share,
      note: p.share ? "Redistribution allowed" : "Redistribution not permitted",
    },
    {
      key: "adapt",
      label: "Adapt",
      allowed: p.adapt,
      note: p.adapt ? "Modification allowed" : "Modification not permitted",
    },
    {
      key: "commercial",
      label: "Commercial use",
      allowed: p.commercial,
      note: p.commercial
        ? "Commercial use permitted"
        : "Commercial use not permitted",
    },
    {
      key: "attribution",
      label: "Attribution",
      allowed: p.attribution,
      note: p.attribution ? "Attribution required" : "Attribution not required",
    },
  ];
}