import { ArtPost } from "./ArtPost";
import { Settings2 } from "lucide-react";

const icon =
    "https://styles.redditmedia.com/t5_2qk7x/styles/communityIcon_gw3ypy6d357e1.png?width=48&height=48&frame=1&auto=webp&crop=48%3A48%2Csmart&s=82b75539c0b754d2498ab3c553d8857e6215fcc5";

export default function GalleryPage() {
    return (
        <div className="w-full min-h-screen bg-white dark:bg-[#0e1113] ">
            <div className="w-full max-w-170 mx-auto px-4 py-6">

                <div className="flex justify-end items-center mb-4 mx-2">
                    <button className="p-2 rounded-full hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f] transition cursor-pointer">
                        <Settings2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <hr className="pb-1" />
                <div className="flex flex-col">
                    <ArtPost
                        subredditName="ArtPH"
                        subredditHref="/gallery"
                        subredditIconSrc={icon}
                        username="ArtistName"
                        userHref="/profile/ArtistName"
                        timeAgo="3 hours ago"
                        title="Wala na talagang pag-asa sa Pilipinas."
                        imageSrc={icon}
                        score="1.2k"
                    />

                    <hr className="my-2" />

                    <ArtPost
                        subredditName="ArtPH"
                        subredditHref="/gallery"
                        subredditIconSrc={icon}
                        username="ArtistName"
                        userHref="/profile/ArtistName"
                        timeAgo="3 hours ago"
                        title="Wala na talagang pag-asa sa Pilipinas."
                        imageSrc={icon}
                        score="1.2k"
                    />

                    <hr className="my-2" />

                    <ArtPost
                        subredditName="ArtPH"
                        subredditHref="/gallery"
                        subredditIconSrc={icon}
                        username="ArtistName"
                        userHref="/profile/ArtistName"
                        timeAgo="3 hours ago"
                        title="Wala na talagang pag-asa sa Pilipinas."
                        imageSrc={icon}
                        score="1.2k"
                    />

                    <hr className="my-2" />

                    <ArtPost
                        subredditName="ArtPH"
                        subredditHref="/gallery"
                        subredditIconSrc={icon}
                        username="ArtistName"
                        userHref="/profile/ArtistName"
                        timeAgo="3 hours ago"
                        title="Wala na talagang pag-asa sa Pilipinas."
                        imageSrc={icon}
                        score="1.2k"
                    />
                </div>
            </div>
        </div>
    );
}