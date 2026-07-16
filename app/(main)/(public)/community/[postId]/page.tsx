import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostDetailClient } from "@/features/(user)/community/components/PostDetailClient";
import { getCommunityPostById } from "@/features/(user)/community/server/community-feed";

type PostPageProps = {
  params: Promise<{ postId: string }>;
};

// Deduped so generateMetadata and the page share a single fetch per request.
const loadPost = cache(getCommunityPostById);

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const data = await loadPost(postId);

  if (!data) {
    return { title: "Post not found — ArtForgeLab" };
  }

  const { post } = data;
  const description =
    post.excerpt ?? `A community artwork shared by @${post.username} on ArtForgeLab.`;

  return {
    title: `${post.title} — ArtForgeLab Community`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.imageSrc ? [{ url: post.imageSrc }] : undefined,
    },
  };
}

export default async function CommunityPostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const data = await loadPost(postId);

  if (!data) {
    notFound();
  }

  return <PostDetailClient {...data} />;
}
