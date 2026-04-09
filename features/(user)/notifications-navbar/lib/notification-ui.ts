import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    FileCheck,
    ShieldCheck,
    Gavel,
    Megaphone,
    type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "../types";

export function getNotificationUI(type: NotificationType): {
    icon: LucideIcon;
    color: string;
    bg: string;
} {
    switch (type) {
        case "artwork_registered":
            return {
                icon: FileCheck,
                color: "text-green-500",
                bg: "bg-green-500/10",
            };

        case "scan_completed":
            return {
                icon: CheckCircle2,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
            };

        case "scan_flagged":
            return {
                icon: AlertTriangle,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
            };

        case "scan_failed":
            return {
                icon: XCircle,
                color: "text-red-500",
                bg: "bg-red-500/10",
            };

        case "report_submitted":
        case "report_resolved":
            return {
                icon: Gavel,
                color: "text-purple-500",
                bg: "bg-purple-500/10",
            };

        case "blockchain_recorded":
            return {
                icon: ShieldCheck,
                color: "text-cyan-500",
                bg: "bg-cyan-500/10",
            };

        case "system_announcement":
        default:
            return {
                icon: Megaphone,
                color: "text-slate-500",
                bg: "bg-slate-500/10",
            };
    }
}