"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CommunityPageData, Post, VoteType } from "../types";
import type { ReportPayload } from "../../report-infringement/types";
import { voteOnPost } from "../server/vote-on-post";

type UseCommunityPageParams = Pick<CommunityPageData, "authed" | "posts">;

type VoteMutationInput = {
  postId: string;
  voteType: Exclude<VoteType, null>;
};

function applyOptimisticVote(
  post: Post,
  voteType: Exclude<VoteType, null>
): Post {
  const currentVote = post.currentUserVote;

  if (currentVote === voteType) {
    if (voteType === "upvote") {
      return {
        ...post,
        currentUserVote: null,
        upvoteCount: Math.max(0, post.upvoteCount - 1),
        score: post.score - 1,
      };
    }

    return {
      ...post,
      currentUserVote: null,
      downvoteCount: Math.max(0, post.downvoteCount - 1),
      score: post.score + 1,
    };
  }

  if (currentVote === null) {
    if (voteType === "upvote") {
      return {
        ...post,
        currentUserVote: "upvote",
        upvoteCount: post.upvoteCount + 1,
        score: post.score + 1,
      };
    }

    return {
      ...post,
      currentUserVote: "downvote",
      downvoteCount: post.downvoteCount + 1,
      score: post.score - 1,
    };
  }

  if (currentVote === "downvote" && voteType === "upvote") {
    return {
      ...post,
      currentUserVote: "upvote",
      upvoteCount: post.upvoteCount + 1,
      downvoteCount: Math.max(0, post.downvoteCount - 1),
      score: post.score + 2,
    };
  }

  return {
    ...post,
    currentUserVote: "downvote",
    upvoteCount: Math.max(0, post.upvoteCount - 1),
    downvoteCount: post.downvoteCount + 1,
    score: post.score - 2,
  };
}

export function useCommunityPage({
  authed,
  posts: initialPosts,
}: UseCommunityPageParams) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [reportOpen, setReportOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const requireAuth = (nextMessage: string, post: Post) => {
    setSelectedPost(post);

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

    onMutate: async ({ postId, voteType }) => {
      setPendingPostId(postId);

      let previousPostsSnapshot: Post[] = [];

      setPosts((current) => {
        previousPostsSnapshot = current;

        return current.map((item) =>
          item.postId === postId ? applyOptimisticVote(item, voteType) : item
        );
      });

      return { previousPosts: previousPostsSnapshot, postId };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousPosts) {
        setPosts(context.previousPosts);
      }

      setMessage("Unable to submit vote.");
      setLoginOpen(true);
    },

    onSuccess: (result, _variables, context) => {
      if (!result.success) {
        if (context?.previousPosts) {
          setPosts(context.previousPosts);
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
      setPendingPostId(null);
    },
  });

  const openPostViewer = (post: Post) => {
    setSelectedPost(post);
    setViewerOpen(true);
  };

  const openReport = (post: Post) => {
    if (!requireAuth("You must be logged in to report an artwork.", post)) {
      return;
    }

    setReportOpen(true);
  };

  const submitVote = (post: Post, voteType: Exclude<VoteType, null>) => {
    if (!requireAuth(`You must be logged in to ${voteType} an artwork.`, post)) {
      return;
    }

    const latestPost = posts.find((item) => item.postId === post.postId) ?? post;

    voteMutation.mutate({
      postId: latestPost.postId,
      voteType,
    });
  };

  const upVote = (post: Post) => {
    submitVote(post, "upvote");
  };

  const downVote = (post: Post) => {
    submitVote(post, "downvote");
  };

  const handleSubmitReport = async (_payload: ReportPayload) => {
    if (!selectedPost) return;
    setReportOpen(false);
  };

  const selectedLivePost =
    selectedPost
      ? posts.find((item) => item.postId === selectedPost.postId) ?? selectedPost
      : null;

  return {
    state: {
      posts,
      reportOpen,
      loginOpen,
      viewerOpen,
      message,
      selectedPost: selectedLivePost,
      isPending: voteMutation.isPending,
      pendingPostId,
    },
    actions: {
      setReportOpen,
      setLoginOpen,
      setViewerOpen,
      openPostViewer,
      openReport,
      upVote,
      downVote,
      handleSubmitReport,
    },
  };
}