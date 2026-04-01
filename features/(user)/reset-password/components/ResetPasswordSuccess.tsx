import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ResetPasswordSuccess() {
    return (
        <Card className="p-6 text-center border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="space-y-4 pt-2">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h1 className="text-2xl font-bold text-white">Password updated!</h1>
                <p className="text-sm text-slate-400">
                    Your password has been changed. Redirecting to sign in...
                </p>
            </CardContent>
        </Card>
    );
}