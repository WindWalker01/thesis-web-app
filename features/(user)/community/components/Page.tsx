import CommunityPageClient from "@/features/(user)/community/components/CommunityPageClient";
import { getCommunityFeedData } from "../server/community-feed";

export default async function CommunityPage() {
  const data = await getCommunityFeedData();

  return <CommunityPageClient {...data} />;
}