export type NotifCategory = "all" | "ownership" | "plagiarism" | "community";

export type NotificationType =
    | "artwork_registered"
    | "scan_completed"
    | "scan_flagged"
    | "scan_failed"
    | "report_submitted"
    | "report_resolved"
    | "blockchain_recorded"
    | "system_announcement";

export type AppNotification = {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    related_art_id: string | null;
    related_report_id: string | null;
    related_scan_id: string | null;
    action_url: string | null;
    metadata: Record<string, unknown> | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
};

export type UiNotification = AppNotification & {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    timestamp: string;
    category: NotifCategory;
};

export const CATEGORY_TABS: { id: NotifCategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "ownership", label: "Ownership" },
    { id: "plagiarism", label: "Plagiarism" },
    { id: "community", label: "Community" },
];