"use client";

import { Settings2 } from "lucide-react";
import { ArtPost } from "./ArtPost";
import { LoginRequiredModal } from "./LoginRequiredModal";
import { ReportModal } from "../../report-infringement/components/ReportModal";
import { Post } from "../types";
import { useGalleryPage } from "../hooks/useGalleryPage";

// Demo icon used for mock posts (replace with actual post image/icon from backend later)
const icon =
  "https://styles.redditmedia.com/t5_2qk7x/styles/communityIcon_gw3ypy6d357e1.png?width=48&height=48&frame=1&auto=webp&crop=48%3A48%2Csmart&s=82b75539c0b754d2498ab3c553d8857e6215fcc5";

/**
 * Temporary hardcoded posts for UI testing.
 * In production, this will normally come from an API (database).
 */
const POSTS: Post[] = [
  {
    id: "p1",
    subredditName: "ArtPH",
    subredditHref: "/gallery",
    subredditIconSrc: icon,
    username: "ArtistName",
    userHref: "/profile/ArtistName",
    timeAgo: "3 hours ago",
    title: "Wala na talagang pag-asa sa Pilipinas.",
    imageSrc: icon,
    score: "1.2k",
  },
  {
    id: "p2",
    subredditName: "ArtPH",
    subredditHref: "/gallery",
    subredditIconSrc: icon,
    username: "ArtistName",
    userHref: "/profile/ArtistName",
    timeAgo: "3 hours ago",
    title: "Wala na talagang pag-asa sa Pilipinas.",
    imageSrc: icon,
    score: "1.2k",
  },
  {
    id: "p3",
    subredditName: "ArtPH",
    subredditHref: "/gallery",
    subredditIconSrc: icon,
    username: "ArtistName",
    userHref: "/profile/ArtistName",
    timeAgo: "3 hours ago",
    title: "Wala na talagang pag-asa sa Pilipinas.",
    imageSrc: icon,
    score: "1.2k",
  },
  {
    id: "p4",
    subredditName: "ArtPH",
    subredditHref: "/gallery",
    subredditIconSrc: icon,
    username: "ArtistName",
    userHref: "/profile/ArtistName",
    timeAgo: "3 hours ago",
    title: "Wala na talagang pag-asa sa Pilipinas.",
    imageSrc: icon,
    score: "1.2k",
  },
];

/**
 * GalleryPageClient
 * - This is the client-side version of the Gallery page.
 * - `authed` tells us if the user is logged in (passed from parent/server).
 * - We render posts and connect UI actions (report/upvote/downvote) to our hook logic.
 */
export default function GalleryPageClient({ authed }: { authed: boolean }) {
  /**
   * useGalleryPage returns:
   * - state: modal open/close flags + selected post + message
   * - actions: functions that mutate state based on user interaction
   */
  const { state, actions } = useGalleryPage(authed);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0e1113]">
      <div className="w-full max-w-170 mx-auto px-4 py-6">
        {/* Top-right settings button (placeholder for future settings / filters) */}
        <div className="flex justify-end items-center mb-4 mx-2">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f] transition cursor-pointer"
            aria-label="Gallery settings"
          >
            <Settings2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <hr className="pb-1" />

        {/* Post list */}
        <div className="flex flex-col">
          {POSTS.map((post, idx) => (
            <div key={post.id}>
              <ArtPost
                {...post}
                /**
                 * When user clicks "Report Artwork" from the post menu:
                 * - If not logged in, show LoginRequiredModal
                 * - If logged in, open the ReportModal and set selectedPost
                 */
                onReport={() => actions.openReport(post)}
                /**
                 * Voting actions are guarded by auth as well:
                 * - If not logged in, show LoginRequiredModal
                 * - If logged in, proceed (for now we console.log; later call API)
                 */
                onUpvote={() => actions.upVote(post)}
                onDownvote={() => actions.downVote(post)}
              />

              {/* Separator line between posts (but not after the last one) */}
              {idx !== POSTS.length - 1 && <hr className="my-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* ===================== Login Required Modal ===================== */}
      <LoginRequiredModal
        open={state.loginOpen}
        onOpenChange={actions.setLoginOpen}
        loginHref="/login"
        message={state.message}
      />

      {/* ===================== Report Modal ===================== */}
      <ReportModal
        open={state.reportOpen}
        onOpenChange={actions.setReportOpen}
        postId={state.selectedPost?.id}
        title={state.selectedPost?.title}
        username={state.selectedPost?.username}
        onSubmit={actions.handleSubmitReport}
      />
    </div>
  );
}