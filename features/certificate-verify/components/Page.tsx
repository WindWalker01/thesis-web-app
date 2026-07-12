import { CertificateVerifiedBadge } from "./CertificateVerifiedBadge";
import { CertificateNotFoundState } from "./CertificateNotFoundState";
import { VerificationCard } from "./VerificationCard";
import type { CertificateVerificationResult } from "../types";

export function CertificateVerifyPage({
  result,
}: {
  result: CertificateVerificationResult;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-16 pt-24 sm:pt-28 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto w-full max-w-xl space-y-6 sm:space-y-8">
        {!result.found ? (
          <CertificateNotFoundState />
        ) : (
          <>
            <CertificateVerifiedBadge
              valid={result.data.valid}
              revoked={result.data.revoked}
            />

            <VerificationCard data={result.data} />

            <p className="text-center text-xs text-slate-400 sm:text-sm dark:text-slate-500">
              ArtForgeLab — Digital Artists IPR Management System
            </p>
          </>
        )}
      </div>
    </main>
  );
}
