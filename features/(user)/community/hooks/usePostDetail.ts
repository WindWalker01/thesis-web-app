"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Post, VoteType } from "../types";
import type { ReportPayload } from "../subfeatures/report-artwork/types";
import { voteOnPost } from "../server/vote-on-post";
import { applyOptimisticVote } from "../lib/optimistic-vote";
import { submitArtworkReport } from "../subfeatures/report-artwork/server/report-artwork";

type UsePostDetailParams = {
  authed: boolean;
  currentUserId: string | null;
  post: Post;
};

type VoteMutationInput = {
  postId: string;
  voteType: Exclude<VoteType, null>;
};

export function usePostDetail({
  authed,
  currentUserId,
  post: initialPost,
}: UsePostDetailParams) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [post, setPost] = useState<Post>(initialPost);
  const [reportOpen, setReportOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  // Keep local state in sync when the server component re-renders (router.refresh).
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const isOwner = currentUserId !== null && currentUserId === post.userId;

  const requireAuth = (nextMessage: string) => {
    if (!authed) {
      setMessage(nextMessage);
      setLoginOpen(true);
      return false;
    }

    return true;
  };

  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: VoteMutationInput) => {
      return voteOnPost({ postId, voteType });
    },

    onMutate: ({ voteType }) => {
      setIsVoting(true);
      const previousPost = post;
      setPost((current) => applyOptimisticVote(current, voteType));
      return { previousPost };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousPost) {
        setPost(context.previousPost);
      }

      setMessage("Unable to submit vote.");
      setLoginOpen(true);
    },

    onSuccess: (result, _variables, context) => {
      if (!result.success) {
        if (context?.previousPost) {
          setPost(context.previousPost);
        }

        setMessage(result.message ?? "Unable to submit vote.");
        setLoginOpen(true);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    },

    onSettled: () => {
      setIsVoting(false);
    },
  });

  const submitVote = (voteType: Exclude<VoteType, null>) => {
    if (!requireAuth(`You must be logged in to ${voteType} an artwork.`)) {
      return;
    }

    voteMutation.mutate({ postId: post.postId, voteType });
  };

  const openReport = () => {
    if (!requireAuth("You must be logged in to report an artwork.")) {
      return;
    }

    setReportOpen(true);
  };

  const handleSubmitReport = async (payload: ReportPayload) => {
    const result = await submitArtworkReport(payload);

    if (result.success) {
      setPost((current) => ({ ...current, hasReported: true }));
    }

    toast.success(result.message);
    return result;
  };

  return {
    state: {
      post,
      isOwner,
      reportOpen,
      loginOpen,
      message,
      isVoting,
    },
    actions: {
      setReportOpen,
      setLoginOpen,
      upVote: () => submitVote("upvote"),
      downVote: () => submitVote("downvote"),
      openReport,
      handleSubmitReport,
    },
  };
}
