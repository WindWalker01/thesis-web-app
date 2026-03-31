import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle, Edit, ShieldCheck, Upload } from "lucide-react";

import type { UserProfile } from "../server/profile";

interface Props {
    profile: UserProfile;
    children?: React.ReactNode; // stats strip slot
}

export function ProfileBanner({ profile, children }: Props) {
    return (
        <div className="relative bg-slate-900 overflow-hidden">

            {/* Banner background */}
            <div className="h-40 md:h-52 w-full bg-linear-to-r from-blue-950 via-slate-900 to-orange-950 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-40 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-14 pb-6 flex flex-col md:flex-row md:items-end gap-5">

                    {/* Avatar — image if available, initials fallback */}
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-linear-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_32px_rgba(59,130,246,0.4)] border-4 border-slate-900 relative">
                            {profile.profileImage ? (
                                <Image
                                    src={profile.profileImage}
                                    alt={profile.fullName}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span>{profile.initials}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-slate-900">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>

                    {/* Profile text */}
                    <div className="flex-1 min-w-0 text-white pb-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-xl md:text-2xl font-black">{profile.fullName}</h1>
                            <span className="text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" />
                                Verified Artist
                            </span>
                        </div>

                        <p className="text-sm text-slate-400 mb-1">{profile.username}</p>

                        {profile.bio && (
                            <p className="text-xs text-slate-500 max-w-lg leading-relaxed hidden md:block">
                                {profile.bio}
                            </p>
                        )}

                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {profile.joinDate}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0 pb-1">
                        <Link href="/profile/edit-profile">
                            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_16px_rgba(59,130,246,0.3)]">
                                <Edit className="w-3.5 h-3.5" />
                                Edit Profile
                            </button>
                        </Link>
                        <Link href="/upload-artwork">
                            <button className="flex items-center gap-2 border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                                <Upload className="w-3.5 h-3.5" />
                                Upload
                            </button>
                        </Link>
                    </div>

                </div>

                {/* Stats slot */}
                {children}
            </div>
        </div>
    );
}