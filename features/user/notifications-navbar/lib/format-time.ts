export function formatNotificationTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString();
}