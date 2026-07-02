import { CheckCircle2, Clock } from "lucide-react";

type Props = {
    valid: boolean;
};

/** Large status header shown at the top of the verification page. */
export function CertificateVerifiedBadge({ valid }: Props) {
    if (valid) {
        return (
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    Certificate Verified
                </h1>
                <p className="max-w-md text-base text-slate-500 dark:text-slate-400">
                    This certificate is genuine and backed by a valid blockchain
                    registration in the ArtForgeLab IPR Management System.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="h-9 w-9 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Registration Pending
            </h1>
            <p className="max-w-md text-base text-slate-500 dark:text-slate-400">
                This artwork exists in the system but does not yet have a
                confirmed blockchain registration.
            </p>
        </div>
    );
}
