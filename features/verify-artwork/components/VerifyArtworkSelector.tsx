"use client";

import Image from "next/image";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { truncateHash } from "@/lib/client-utils";
import type { VerifiableArtworkItem } from "../types";

export function VerifyArtworkSelector({
    search,
    onSearchChange,
    items,
    selectedArtworkId,
    onSelectArtwork,
    onVerify,
    isVerifying,
}: {
    search: string;
    onSearchChange: (value: string) => void;
    items: VerifiableArtworkItem[];
    selectedArtworkId: string;
    onSelectArtwork: (value: string) => void;
    onVerify: () => void;
    isVerifying: boolean;
}) {
    return (
        <div className="rounded-3xl border border-border bg-card/80 p-4 backdrop-blur-xl md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-lg font-black">Select artwork to verify</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose a registered artwork, then run the ownership check.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:min-w-[280px] lg:w-[340px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search title, tx hash, work id..."
                            className="h-11 rounded-2xl pl-10"
                        />
                    </div>

                    <Button
                        onClick={onVerify}
                        disabled={!selectedArtworkId || isVerifying}
                        className="h-11 rounded-2xl"
                    >
                        {isVerifying ? "Verifying..." : "Verify artwork"}
                    </Button>
                </div>
            </div>

            <div className="mt-4 grid gap-3">
                {items.map((item) => {
                    const active = item.id === selectedArtworkId;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectArtwork(item.id)}
                            className={`flex w-full items-start gap-4 rounded-2xl border p-3 text-left transition-all ${active
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-background/60 hover:bg-muted/50"
                                }`}
                        >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                                {item.imageUrl ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate font-bold">{item.title}</h3>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                        {item.status}
                                    </span>
                                </div>

                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {item.description || "No description provided."}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                                    <span>Work ID: {item.workId ?? "Not recorded"}</span>
                                    <span>TX: {item.txHash ? truncateHash(item.txHash, 10, 8) : "—"}</span>
                                    <span>Chain: {item.chain ?? "—"}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}