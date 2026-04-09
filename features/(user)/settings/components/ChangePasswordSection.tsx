import { Shield } from "lucide-react";
import { Card } from "./Page";
import ChangePasswordForm from "../subfeatures/change-password/components/ChangePasswordForm";

export default function ChangePasswordSection() {
    return (
        <>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="text-xl font-black">Security</h2>
            </div>

            <Card>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Change Password
                    </p>
                </div>

                <ChangePasswordForm />
            </Card>
        </>
    );
}