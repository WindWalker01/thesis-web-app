import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ResetPasswordLoading() {
    return (
        <Card className="p-6 text-center border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="space-y-4 pt-2">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h1 className="text-2xl font-bold text-white">Loading...</h1>
                <p className="text-sm text-slate-400">
                    Preparing your password recovery flow.
                </p>
            </CardContent>
        </Card>
    );
}