export function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                {icon}
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-300">{label}</p>
            <p className="mt-1 text-lg font-black text-white">{value}</p>
        </div>
    );
}