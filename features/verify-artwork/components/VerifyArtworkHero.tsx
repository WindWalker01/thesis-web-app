import { Fingerprint, ShieldCheck, Sparkles } from "lucide-react";

export function VerifyArtworkHero() {
    return (
        <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="container mx-auto px-4 py-10 md:px-6 md:py-14">
                <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Proof of authorship and ownership
                    </div>

                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                        Verify artwork ownership against the blockchain record
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Select one of your registered artworks and compare its stored
                        ownership data with the blockchain record to confirm whether the
                        proof of authorship is valid, complete, and unchanged.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
                            <Fingerprint className="h-4 w-4 text-primary" />
                            Hash-by-hash comparison
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Live on-chain validation
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Clear verification summary
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}