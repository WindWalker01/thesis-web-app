import { CheckCircle2, Clock, ShieldX } from "lucide-react";

import { cn } from "@/lib/client-utils";

type Props = {
    valid: boolean;
    revoked?: boolean;
};

type Variant = {
    icon: typeof CheckCircle2;
    ring: string;
    iconColor: string;
    title: string;
    description: string;
};

/** Large status header shown at the top of the verification page. */
export function CertificateVerifiedBadge({ valid, revoked = false }: Props) {
    const variant: Variant = revoked
        ? {
              icon: ShieldX,
              ring: "bg-red-500/10 ring-red-500/20",
              iconColor: "text-red-600 dark:text-red-400",
              title: "Certificate Revoked",
              description:
                  "This certificate has been revoked on-chain and is no longer valid. Do not treat it as proof of registration.",
          }
        : valid
          ? {
                icon: CheckCircle2,
                ring: "bg-green-500/10 ring-green-500/20",
                iconColor: "text-green-600 dark:text-green-400",
                title: "Certificate Verified",
                description:
                    "This certificate is genuine and backed by a valid blockchain registration in the ArtForgeLab IPR Management System.",
            }
          : {
                icon: Clock,
                ring: "bg-amber-500/10 ring-amber-500/20",
                iconColor: "text-amber-600 dark:text-amber-400",
                title: "Registration Pending",
                description:
                    "This artwork exists in the system but does not yet have a confirmed blockchain registration.",
            };

    const Icon = variant.icon;

    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <div
                className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full ring-8 sm:h-16 sm:w-16",
                    variant.ring,
                )}
            >
                <Icon className={cn("h-8 w-8 sm:h-9 sm:w-9", variant.iconColor)} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {variant.title}
            </h1>
            <p className="max-w-md text-sm text-slate-500 sm:text-base dark:text-slate-400">
                {variant.description}
            </p>
        </div>
    );
}
