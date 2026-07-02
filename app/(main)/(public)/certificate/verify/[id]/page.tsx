import type { Metadata } from "next";

import { CertificateVerifyPage } from "@/features/certificate-verify/components/Page";
import { verifyCertificate } from "@/features/certificate-verify/server/verify-certificate";

export const metadata: Metadata = {
  title: "Certificate Verification — ArtForgeLab",
  description:
    "Verify the authenticity of an ArtForgeLab artwork registration certificate.",
};

export default async function CertificateVerifyRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await verifyCertificate(id);

  return <CertificateVerifyPage result={result} />;
}
