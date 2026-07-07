import type { Post, VoteType } from "../types";

/**
 * Compute the next post state after a vote, applied optimistically before the
 * server confirms. Handles toggling off, switching direction, and first votes.
 */
export function applyOptimisticVote(
  post: Post,
  voteType: Exclude<VoteType, null>,
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
