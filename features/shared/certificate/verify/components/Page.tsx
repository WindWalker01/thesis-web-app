import { CertificateVerifiedBadge } from "./CertificateVerifiedBadge";
import { CertificateNotFoundState } from "./CertificateNotFoundState";
import { VerificationCard } from "./VerificationCard";
import type { CertificateVerificationResult } from "../types";
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";

export async function CertificateVerifyPage({
  result,
}: {
  result: CertificateVerificationResult;
}) {
  const settings = await getRuntimeSettings();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-16 pt-24 sm:pt-28 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8">
        {!result.found ? (
          <div className="mx-auto max-w-xl">
            <CertificateNotFoundState />
          </div>
        ) : (
          <>
            <CertificateVerifiedBadge
              valid={result.data.valid}
              revoked={result.data.revoked}
            />

            <VerificationCard data={result.data} />

            <p className="text-center text-xs text-slate-400 sm:text-sm dark:text-slate-500">
              {settings.platform_name} — {settings.platform_description}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
