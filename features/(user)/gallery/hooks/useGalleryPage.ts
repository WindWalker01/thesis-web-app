"use client";

import { useState } from "react";
import { Post } from "../types";
import { ReportPayload } from "../../report-infringement/types";

/**
 * useGalleryPage
 * Centralizes gallery-page interaction logic:
 * - which post is selected
 * - which modal is open (login vs report)
 * - what message to show the user
 *
 * This prevents UI components from becoming too "logic-heavy".
 */
export function useGalleryPage(authed: boolean) {
  // Modal states
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);

  // Message shown in LoginRequiredModal (depends on action)
  const [message, setMessage] = useState<string>("");

  // Tracks which post the user is currently interacting with (report/vote)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  /**
   * openReport
   * Called when user clicks "Report Artwork".
   * Behavior:
   * - Always set the selectedPost (so modal has the right context)
   * - If user is not authenticated, open login modal instead
   * - Otherwise open the report modal
   */
  const openReport = (post: Post) => {
    setSelectedPost(post);

    if (!authed) {
      setLoginOpen(true);
      setMessage("You must be logged in to report an artwork.");
      return;
    }

    setReportOpen(true);
  };

  /**
   * upVote
   * Auth-guarded action:
   * - if not logged in -> show login modal
   * - else -> do the action (currently just console.log; later replace with API call)
   */
  const upVote = (post: Post) => {
    setSelectedPost(post);

    if (!authed) {
      setLoginOpen(true);
      setMessage("You must be logged in to upvote an artwork.");
      return;
    }

    console.log("Upvoted: ", post);
  };

  /**
   * downVote
   * Same logic as upVote but for downvoting.
   */
  const downVote = (post: Post) => {
    setSelectedPost(post);

    if (!authed) {
      setLoginOpen(true);
      setMessage("You must be logged in to downvote an artwork.");
      return;
    }

    console.log("Downvoted: ", post);
  };

  /**
   * handleSubmitReport
   * Called after user submits the ReportModal form.
   * For now, it logs the payload.
   * In production, you would usually:
   * - POST payload to an API route
   * - show a success toast/message
   * - close the modal on success
   */
  const handleSubmitReport = (payload: ReportPayload) => {
    console.log("REPORT SUBMITTED:", {
      ...payload,
      postTitle: selectedPost?.title,
      reportedUser: selectedPost?.username,
    });

    // Close modal after submission
    setReportOpen(false);
  };

  return {
    // Group state so it’s easy to pass around
    state: { reportOpen, loginOpen, message, selectedPost },

    // Group actions so the component can call them clearly
    actions: {
      setReportOpen,
      setLoginOpen,
      openReport,
      upVote,
      downVote,
      handleSubmitReport,
    },
  };
}