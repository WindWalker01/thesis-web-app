import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-sm tracking-wide text-slate-400 uppercase">{title}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

/**
 * Hero section shown at the top of the upload page: title, blurb, and the
 * three feature stat cards.
 */
export function UploadHero() {
  return (
    <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-4">
            <Badge
              variant="secondary"
              className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Artwork Registration
            </Badge>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Upload and protect your artwork
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-base">
                Submit your original artwork for uniqueness checking, genre
                classification, secure storage, and blockchain-backed
                registration.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <StatCard title="Duplicate Check" value="pHash + Threshold" />
            <StatCard title="Integrity" value="Crypto Hash" />
            <StatCard title="Ledger" value="DB + Blockchain" />
          </div>
        </div>
      </div>
    </section>
  );
}
