function Shimmer({ className }: { className: string }) {
    return <div className={`animate-pulse rounded-lg bg-muted/60 ${className}`} />;
}

export function EditProfileSkeleton() {
    return (
        <div className="space-y-8">
            {/* Avatar row */}
            <div className="flex items-center gap-6">
                <Shimmer className="w-24 h-24 rounded-2xl shrink-0" />
                <div className="space-y-2">
                    <Shimmer className="h-4 w-28" />
                    <Shimmer className="h-3 w-40" />
                    <Shimmer className="h-3 w-20 mt-1" />
                </div>
            </div>

            {/* Separator */}
            <Shimmer className="h-px w-full rounded-none" />

            {/* Section label */}
            <Shimmer className="h-3 w-36" />

            {/* Full Name field */}
            <div className="space-y-2">
                <Shimmer className="h-3.5 w-20" />
                <Shimmer className="h-10 w-full" />
            </div>

            {/* Username field */}
            <div className="space-y-2">
                <Shimmer className="h-3.5 w-20" />
                <Shimmer className="h-10 w-full" />
                <Shimmer className="h-3 w-64" />
            </div>

            {/* Bio field */}
            <div className="space-y-2">
                <Shimmer className="h-3.5 w-8" />
                <Shimmer className="h-24 w-full" />
            </div>

            {/* Separator */}
            <Shimmer className="h-px w-full rounded-none" />

            {/* Buttons */}
            <div className="flex gap-3">
                <Shimmer className="h-10 flex-1" />
                <Shimmer className="h-10 flex-1" />
            </div>
        </div>
    );
}