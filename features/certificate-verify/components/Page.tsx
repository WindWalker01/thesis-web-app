import { CertificateVerifiedBadge } from "./CertificateVerifiedBadge";
import { CertificateNotFoundState } from "./CertificateNotFoundState";
import { OwnerVerificationCard } from "./OwnerVerificationCard";
import { PublicVerificationCard } from "./PublicVerificationCard";
import type { CertificateVerificationResult } from "../types";

export function CertificateVerifyPage({
  result,
}: {
  result: CertificateVerificationResult;
}) {
  return (
    <main className="mt-15 min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-lg space-y-8">
        {!result.found ? (
          <CertificateNotFoundState />
        ) : (
          <>
            <CertificateVerifiedBadge valid={result.data.valid} />

            {result.data.isOwner ? (
              <OwnerVerificationCard data={result.data} />
            ) : (
              <PublicVerificationCard
                certificateStatus={result.data.certificateStatus}
                artworkRegistration={result.data.artworkRegistration}
                ownershipStatus={result.data.ownershipStatus}
                blockchain={`Polygon ${result.data.blockchain}`}
                transactionHash={result.data.transactionHash}
                polygonScanUrl={result.data.polygonScanUrl}
                issuedAt={result.data.issuedAt}
              />
            )}

            <p className="text-center text-sm text-slate-400 dark:text-slate-500">
              ArtForgeLab - Digital Artists IPR Management System
            </p>
          </>
        )}
      </div>
    </main>
  );
}
