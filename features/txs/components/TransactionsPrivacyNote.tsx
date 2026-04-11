import { EyeOff, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function TransactionsPrivacyNote() {
    return (
        <Card className="border-orange-200 bg-orange-500/5 dark:border-orange-900/60">
            <CardContent className="space-y-3 p-5">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-orange-500/20 bg-orange-500/10 p-2 text-orange-500">
                        <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold">Privacy-aware public view</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            This page only shows public transaction metadata such as
                            transaction hash, method, block, age, addresses, and status.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-500">
                        <EyeOff className="h-4 w-4" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Internal user identity, raw artwork details, and private system
                            context are intentionally not displayed here.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}