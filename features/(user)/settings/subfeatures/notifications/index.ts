import {
    Bell,
    ShieldCheck,
    ScanSearch,
    FileCheck,
    MessageCircle,
    Award,
    Hash,
    AlertTriangle,
} from "lucide-react";
import { NotificationType, NotifCategory, AppNotification } from "./types";

export function mapNotificationCategory(type: NotificationType): NotifCategory {
    if (type === "artwork_registered" || type === "blockchain_recorded") {
        return "ownership";
    }

    if (
        type === "scan_completed" ||
        type === "scan_flagged" ||
        type === "scan_failed"
    ) {
        return "plagiarism";
    }

    return "community";
}

export function getNotificationUI(type: NotificationType) {
    switch (type) {
        case "artwork_registered":
            return {
                icon: FileCheck,
                iconColor: "text-green-400",
                iconBg: "bg-green-400/10",
            };

        case "blockchain_recorded":
            return {
                icon: Award,
                iconColor: "text-yellow-400",
                iconBg: "bg-yellow-400/10",
            };

        case "scan_completed":
            return {
                icon: ScanSearch,
                iconColor: "text-green-400",
                iconBg: "bg-green-400/10",
            };

        case "scan_flagged":
            return {
                icon: AlertTriangle,
                iconColor: "text-orange-400",
                iconBg: "bg-orange-400/10",
            };

        case "scan_failed":
            return {
                icon: AlertTriangle,
                iconColor: "text-red-400",
                iconBg: "bg-red-400/10",
            };

        case "report_submitted":
            return {
                icon: MessageCircle,
                iconColor: "text-purple-400",
                iconBg: "bg-purple-400/10",
            };

        case "report_resolved":
            return {
                icon: ShieldCheck,
                iconColor: "text-blue-400",
                iconBg: "bg-blue-400/10",
            };

        case "system_announcement":
            return {
                icon: Hash,
                iconColor: "text-blue-400",
                iconBg: "bg-blue-400/10",
            };

        default:
            return {
                icon: Bell,
                iconColor: "text-slate-400",
                iconBg: "bg-slate-400/10",
            };
    }
}

export function buildFallbackActionUrl(notification: AppNotification): string | null {
    if (notification.action_url) return notification.action_url;

    if (notification.related_art_id) {
        if (
            notification.type === "scan_flagged" ||
            notification.type === "report_submitted" ||
            notification.type === "report_resolved"
        ) {
            return `/profile/issues/${notification.related_art_id}`;
        }

        return `/profile/artworks/${notification.related_art_id}`;
    }

    return null;
}