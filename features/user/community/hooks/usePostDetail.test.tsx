import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { usePostDetail } from "@/features/user/community/hooks/usePostDetail";
import type { Post } from "@/features/user/community/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/user/community/server/vote-on-post", () => ({
  voteOnPost: vi.fn(),
}));

vi.mock(
  "@/features/user/community/subfeatures/report-artwork/server/report-artwork",
  () => ({
    submitArtworkReport: vi.fn(),
  }),
);

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "1",
    postId: "post-1",
    artId: "art-1",
    userId: "user-1",
    subredditName: "digital-art",
    username: "artist",
    createdAt: "2024-01-01T00:00:00.000Z",
    timeAgo: "1d",
    title: "Original title",
    imageSrc: "/art.png",
    score: 0,
    upvoteCount: 0,
    downvoteCount: 0,
    currentUserVote: null,
    visibility: "public",
    isArchived: false,
    isNsfw: false,
    hasReported: false,
    ...overrides,
  };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("usePostDetail", () => {
  it("syncs local post state when the initial post prop changes", () => {
    const first = makePost({ title: "Original title" });
    const second = makePost({ title: "Updated title" });

    const { result, rerender } = renderHook(
      ({ post }: { post: Post }) =>
        usePostDetail({
          authed: true,
          currentUserId: "user-1",
          post,
        }),
      {
        initialProps: { post: first },
        wrapper: createWrapper(),
      },
    );

    expect(result.current.state.post.title).toBe("Original title");

    rerender({ post: second });

    expect(result.current.state.post.title).toBe("Updated title");
  });

  it("opens the login modal when an unauthenticated user tries to vote", () => {
    const post = makePost();

    const { result } = renderHook(
      () =>
        usePostDetail({
          authed: false,
          currentUserId: null,
          post,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.actions.upVote();
    });

    expect(result.current.state.loginOpen).toBe(true);
    expect(result.current.state.message).toContain("logged in");
  });
});
