import { ImageIcon, ScanSearch, Award, Hash } from "lucide-react";

interface Props {
    totalArtworks: number;
    totalScans: number;
    verifiedCount: number;
}

export function ProfileStats({
    totalArtworks,
    totalScans,
    verifiedCount,
}: Props) {
    const stats = [
        {
            label: "Artworks",
            value: totalArtworks,
            icon: ImageIcon,
            color: "text-blue-400",
        },
        {
            label: "Scans",
            value: totalScans,
            icon: ScanSearch,
            color: "text-orange-400",
        },
        {
            label: "Verified",
            value: verifiedCount,
            icon: Award,
            color: "text-green-400",
        },
        {
            label: "Blockchain Proofs",
            value: verifiedCount,
            icon: Hash,
            color: "text-purple-400",
        },
    ];

    return (
        <div className="flex flex-wrap gap-0 border-t border-white/5">
            {stats.map((s, i) => {
                const Icon = s.icon;

                return (
                    <div
                        key={s.label}
                        className={`flex items-center gap-3 px-6 py-4 ${i !== 0 ? "border-l border-white/5" : ""
                            }`}
                    >
                        <Icon className={`w-4 h-4 ${s.color}`} />

                        <div>
                            <p className="text-lg font-black text-white">{s.value}</p>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                {s.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}