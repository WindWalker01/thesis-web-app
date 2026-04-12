import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground">
            {/* Background grid */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Glows */}
            <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Logo */}
                <Link href="/" className="mb-10 flex items-center gap-2 transition-opacity hover:opacity-80">
                    <Image
                        src="/landing-page-elements/AFL_logoWeb.png"
                        alt="ArtForgeLab Logo"
                        width={40}
                        height={48}
                        className="shrink-0"
                    />
                    <span className="text-base font-bold tracking-tight text-blue-500">
                        Art
                        <span className="text-orange-600">
                            Forge<span className="text-foreground">Lab</span>
                        </span>
                    </span>
                </Link>

                {/* 404 number */}
                <div className="relative mb-4 select-none">
                    <span className="bg-linear-to-br from-blue-500 via-primary to-orange-400 bg-clip-text text-[9rem] font-black leading-none tracking-tighter text-transparent sm:text-[12rem]">
                        404
                    </span>
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
                </div>

                {/* Message */}
                <h1 className="mb-3 text-2xl font-black tracking-tight sm:text-3xl">
                    Page not found
                </h1>
                <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    The page you're looking for doesn't exist or has been moved.
                    It may have been removed or the URL might be incorrect.
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                        Go home
                    </Link>
                </div>

                {/* Divider */}
                <div className="mt-12 flex items-center gap-3">
                    <div className="h-px w-16 bg-border" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        or explore
                    </span>
                    <div className="h-px w-16 bg-border" />
                </div>

                {/* Quick links */}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {[
                        { label: "Community", href: "/community" },
                        { label: "Plagiarism Checker", href: "/plagiarism-checker" },
                        { label: "Classify", href: "/classify" },
                        { label: "Blockchain Transactions", href: "/txs" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}