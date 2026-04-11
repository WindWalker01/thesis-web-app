export type OwnershipStatus = "verified" | "pending";
export type HashStatus = "complete" | "processing";
export type ViewMode = "grid" | "list";

export type ArtworkStatus =
  | "active"
  | "under_review"
  | "pending_blockchain"
  | "flagged"
  | "removed"
  | "blockchain_failed"
  | "revoked";

export type ProfileScope = "gallery" | "issues";

export type Artwork = {
  id: string;
  title: string;
  description: string | null;
  img: string | null;
  category: string;
  uploadDate: string;
  ownershipStatus: OwnershipStatus;
  hashStatus: HashStatus;
  color: string;
  createdAt: string;
  status: ArtworkStatus;

  txHash: string | null;
  chain: string | null;
  workId: string | null;
  blockNumber: number | null;

  hasBlockchainRecord: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type Profile = {
  name: string;
  handle: string;
  bio: string;
  joinDate: string;
  totalArtworks: number;
  totalScans: number;
  verifiedCount: number;
  initials: string;
};

export type Category = {
  label: string;
  img: string;
};

export type FilterState = {
  searchQuery: string;
  selectedCategory: string | null;
  selectedStatus: ArtworkStatus | null;
  selectedHash: HashStatus | null;
  sortBy: string;
};

export type SimilaritySourceType = "database" | "internet";

export type SimilarityMatch = {
  type: SimilaritySourceType;
  source: string | null;
  url: string | null;
  link: string | null;
  similarity: number | null;
  imageUrl?: string | null;
  title?: string | null;
};

export type SimilarityHashValue = {
  dhash?: string;
  phash?: string;
  whash?: string;
};

export type SimilarityHashes = {
  blocks?: Record<string, SimilarityHashValue> | null;
  transforms?: Record<string, SimilarityHashValue> | null;
};

export type SimilarityReport = {
  filename: string | null;
  originalHash: string | null;
  success: boolean;
  dbMatch: SimilarityMatch | null;
  webMatch: SimilarityMatch | null;
  bestMatch: SimilarityMatch | null;
  hashes: SimilarityHashes | null;
  rawResponse: unknown | null;
};

export type ArtworkDetail = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  img: string | null;
  category: string;
  uploadDate: string;
  createdAt: string;
  ownershipStatus: OwnershipStatus;
  hashStatus: HashStatus;

  fileHash: string;
  perceptualHash: string;
  authorIdHash: string | null;
  evidenceHash: string | null;
  evidence: unknown | null;

  chain: string | null;
  txHash: string | null;
  blockNumber: number | null;
  workId: string | null;
  status: string;

  hasBlockchainRecord: boolean;
  canEdit: boolean;
  canDelete: boolean;

  plagiarismHashes: unknown | null;

  creator: {
    id: string;
    fullName: string;
    username: string;
    profileImage: string | null;
  } | null;

  similarityScan: IssueSimilarityScan | null;
  similarityReport: SimilarityReport | null;
};

export type IssueReport = {
  id: string;
  reportType: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type IssueSimilarityScan = {
  id: string;
  status: string;
  success: boolean;
  filename: string | null;
  originalHash: string | null;
  totalMatches: number;
  bestSource: string | null;
  bestLink: string | null;
  bestUrl: string | null;
  bestMatchPair: string | null;
  bestSimilarityPercentage: number | null;
  bestMinCombinedDistance: number | null;
  bestAverageCombinedDistance: number | null;
  bestMaxCombinedDistance: number | null;
  matches: unknown[];
  hashes: unknown | null;
  rawResponse: unknown | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IssueDetail = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  img: string | null;
  category: string;
  uploadDate: string;
  createdAt: string;
  ownershipStatus: OwnershipStatus;
  hashStatus: HashStatus;
  status: ArtworkStatus;

  fileHash: string;
  perceptualHash: string;
  authorIdHash: string | null;
  evidenceHash: string | null;
  evidence: unknown | null;

  chain: string | null;
  txHash: string | null;
  blockNumber: number | null;
  workId: string | null;

  plagiarismHashes: unknown | null;

  creator: {
    id: string;
    fullName: string;
    username: string;
    profileImage: string | null;
  } | null;

  similarityScan: IssueSimilarityScan | null;
  similarityReport: SimilarityReport | null;
  reports: IssueReport[];
};

export const SORT_OPTIONS = [
  "Recently Added",
  "Oldest First",
  "Name A–Z",
  "Name Z–A",
  "Verified First",
] as const;