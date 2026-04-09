import Image from "next/image";
import Link from "next/link";

import { User } from "lucide-react";
import { useCurrentUserProfile } from "../../profile/hooks/useFetchProfile";
import { Card } from "../subfeatures/artwork-ownership/components/ArtworkOwnershipSection";

export default function ProfileSection() {
    const { profile } = useCurrentUserProfile();

    return (<>
        <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-xl font-black">Profile</h2>
        </div>
        <Card>
            <div className="p-6 flex items-center gap-5">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-linear-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_32px_rgba(59,130,246,0.4)] border-4 border-slate-900 relative">
                    {profile?.profileImage ? (
                        <Image
                            src={profile.profileImage}
                            alt={profile.fullName}
                            fill
                            sizes="(max-width: 768px) 96px, 112px"
                            loading="eager"
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <span>{profile?.initials}</span>
                    )}
                </div>
                <div>
                    <p className="font-black text-lg">{profile?.fullName}</p>
                    <p className="text-sm text-slate-400">{profile?.username} · Digital Artist</p>
                    <p className="text-xs text-slate-500 mt-1">Member since {profile?.joinDate}</p>
                </div>
            </div>
            <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Link href="/profile/edit-profile">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        Edit Profile →
                    </button>
                </Link>
            </div>
        </Card>
    </>);
}