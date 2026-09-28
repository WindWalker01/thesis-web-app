import type { LucideIcon } from "lucide-react";
import {
  FileClockIcon,
  Fingerprint,
  Flag,
  ImageIcon,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

export type HomeFaq = {
  q: string;
  a: string;
  open?: boolean;
};

export type HomeFeature = {
  label: string;
  icon: LucideIcon;
  desc: string;
};

export type WhyChooseItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  glow: string;
  border: string;
  iconBg: string;
  iconColor: string;
};

export type TeamMember = {
  name: string;
  role: string;
  img: string;
  portfolio_link?: string;
};

export const HERO_STATS = [
  { value: "Perceptual Hash", label: "Similarity Detection" },
  { value: "Cryptographic Hash", label: "Proof of Authorship" },
  { value: "Blockchain", label: "Immutable Documentation" },
] as const;

export type ProductStackStep = {
  title: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
};

export const PRODUCT_STACK = {
  title: "The whole path, or just the step you need.",
  description:
    "Register an artwork from upload through an on-chain record, or use classification, similarity checks, and verification on their own. Each part stands by itself.",
} as const;

export const PRODUCT_STACK_STEPS: readonly ProductStackStep[] = [
  {
    title: "Upload",
    description:
      "Bring in the file, the title, and the details that identify the work.",
    href: "/upload-artwork",
    image: "/landing-page-elements/upload-artwork.png",
    imageAlt: "Artwork upload form",
  },
  {
    title: "Fingerprints",
    description:
      "Catch similar images with a visual hash and prove the file is unchanged.",
    href: "/plagiarism-checker",
    image: "/landing-page-elements/similiarity-checking.png",
    imageAlt: "Similarity check results",
  },
  {
    title: "On-chain record",
    description:
      "Record the file hash and a timestamp. The image stays off the chain.",
    href: "/txs",
    image: "/landing-page-elements/on-chain-record.png",
    imageAlt: "On-chain registry record",
  },
  {
    title: "Monitor",
    description:
      "Review the artworks, similarity scans, and reports in one dashboard.",
    href: "/dashboard",
    image: "/landing-page-elements/dashboard.png",
    imageAlt: "Artist dashboard",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Upload & Classify",
    desc: "Submit your digital artwork with metadata. The system automatically classifies your work and prepares it for processing.",
  },
  {
    title: "Perceptual & Cryptographic Hashing",
    desc: "Two unique digital fingerprints are generated — one for visual similarity detection and another for integrity verification.",
  },
  {
    title: "Blockchain Recording",
    desc: "A cryptographic proof is recorded on-chain with an immutable timestamp, creating verifiable evidence tied to a specific point in time.",
  },
  {
    title: "Monitor & Manage",
    desc: "Track similarity reports, manage your artwork portfolio, and maintain authorship documentation from a single dashboard.",
  },
] as const;

export const PLATFORM_FEATURES: HomeFeature[] = [
  {
    label: "Artwork Registration",
    icon: ImageIcon,
    desc: "Upload your digital artwork with metadata. Organize and manage your creative portfolio in one secure location.",
  },
  {
    label: "Proof of Authorship",
    icon: Fingerprint,
    desc: "Cryptographic hashing generates a unique digital fingerprint recorded on-chain with an immutable timestamp as verifiable evidence.",
  },
  {
    label: "Similarity Detection",
    icon: Search,
    desc: "Perceptual hashing detects visually similar artworks across the database, serving as an indicator for possible plagiarism or unauthorized modifications.",
  },
  {
    label: "Community Recognition",
    icon: Users,
    desc: "Share your work in the public gallery. Earn upvotes from the community and build visibility for your digital art portfolio.",
  },
  {
    label: "Reporting & Complaints",
    icon: Flag,
    desc: "Submit reports of suspected infringement with supporting evidence. Track the status of your reports through administrative review.",
  },
  {
    label: "Blockchain Documentation",
    icon: ShieldCheck,
    desc: "Maintain transparent, auditable records. Every cryptographic proof is permanently documented on-chain and independently verifiable.",
  },
];

export const AUTHORSHIP_HIGHLIGHTS = [
  { stat: "Perceptual Hashing", label: "Visual Similarity Analysis" },
  { stat: "Blockchain", label: "Immutable Documentation" },
] as const;

export const WHY_CHOOSE_ITEMS: WhyChooseItem[] = [
  {
    icon: Fingerprint,
    title: "Proof of Authorship",
    desc: "Cryptographic hashing combined with blockchain timestamping creates verifiable evidence of authorship at a specific point in time.",
    glow: "rgba(59,130,246,0.35)",
    border: "rgba(59,130,246,0.4)",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-300",
  },
  {
    icon: FileClockIcon,
    title: "Blockchain Documentation",
    desc: "Records are stored on-chain and cannot be altered or deleted, providing transparent and auditable documentation.",
    glow: "rgba(99,102,241,0.35)",
    border: "rgba(99,102,241,0.4)",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-300",
  },
  {
    icon: Search,
    title: "Similarity Detection",
    desc: "Perceptual hashing algorithms analyze visual similarity to detect possible instances of plagiarism or unauthorized modification.",
    glow: "rgba(251,146,60,0.3)",
    border: "rgba(251,146,60,0.4)",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-300",
  },
  {
    icon: ShieldCheck,
    title: "Artwork Portfolio",
    desc: "Organize and manage your digital artwork collection with metadata, similarity reports, and author documentation in one place.",
    glow: "rgba(234,179,8,0.3)",
    border: "rgba(234,179,8,0.35)",
    iconBg: "bg-yellow-500/15",
    iconColor: "text-yellow-300",
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Ruzzel",
    role: "Lead Developer",
    img: "/team-image/ruzzel.png",
    portfolio_link: "https://ruzzel.vercel.app",
  },
  {
    name: "Tenshin",
    role: "Front/Backend Engineer",
    img: "/team-image/tenshin.jpg",
    portfolio_link: "https://tenshinponteres.dev",
  },
  {
    name: "Nathaniel",
    role: "UI/UX Designer",
    img: "/team-image/nathanielSD.jpg",
  },
];

export const HOME_FAQS: HomeFaq[] = [
  {
    q: "How does artwork registration work?",
    a: "When you upload a digital artwork, the system automatically classifies it and generates two types of digital fingerprints — a perceptual hash for visual similarity detection and a cryptographic hash for integrity verification. The cryptographic hash is then recorded on the blockchain with an immutable timestamp, creating verifiable proof of authorship documentation.",
    open: true,
  },
  {
    q: "What is perceptual hashing and how does it detect similar artworks?",
    a: "Perceptual hashing is an algorithm that creates a compact visual fingerprint of an image based on its visual features — not its raw pixel data. Unlike cryptographic hashing (where even one different pixel produces a completely different hash), perceptual hashes remain similar for visually similar images. This allows the system to detect modified versions, derivatives, and possible instances of plagiarism by comparing hashes across the artwork database.",
  },
  {
    q: "What information is recorded on the blockchain?",
    a: "Only the cryptographic hash of the artwork and a timestamp are stored on-chain as part of a blockchain transaction. No personal data, artwork files, or image content is ever stored on the blockchain. The transaction serves as immutable evidence linking the artwork hash to a specific point in time, which can be independently verified.",
  },
  {
    q: "Does ArtForgeLab replace copyright registration with IPOPHL?",
    a: "No. ArtForgeLab is a documentation and evidence-generation tool. It does not confer legal copyright, nor does it replace formal copyright registration with the Intellectual Property Office of the Philippines (IPOPHL) or any other legal authority. Artists should still pursue formal registration for full legal protection.",
  },
  {
    q: "Can the system determine whether legal infringement has occurred?",
    a: "No. The similarity detection module only identifies visually similar artworks based on perceptual hashing. It serves as an indicator for possible plagiarism, but it does not — and cannot — automatically determine legal infringement. Such determinations require judicial or administrative proceedings under applicable intellectual property laws.",
  },
  {
    q: "How are reports and complaints handled?",
    a: "If you believe your work has been infringed, you can submit a report with supporting evidence through the platform. Reports are reviewed administratively, and you can track the status of your report through your dashboard. The platform facilitates documentation and evidence collection but does not adjudicate disputes.",
  },
];

export function initialOpenFaqIndex(
  faqs: readonly { open?: boolean }[],
): number | null {
  const index = faqs.findIndex((faq) => faq.open);
  return index >= 0 ? index : null;
}

export function homeSignupHref(isAuthenticated: boolean) {
  return isAuthenticated ? "/upload-artwork" : "/register";
}

export function heroCtaLabel(isAuthenticated: boolean) {
  return isAuthenticated ? "Upload Artwork" : "Sign Up";
}

export function closingCtaLabel(isAuthenticated: boolean) {
  return isAuthenticated ? "Upload Artwork" : "Get Started";
}

export type EvidenceCard = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  background?: string;
};

export const EVIDENCE_CARDS_COPY = {
  titleLines: ["The record that", "outlasts the post"],
  description:
    "Platforms close and social accounts disappear. Keep permanent, cryptographic proof of your artwork's existence and ownership.",
} as const;

export const EVIDENCE_CARDS: readonly EvidenceCard[] = [
  {
    title: "Proof of Authorship",
    description:
      "A timestamped cryptographic fingerprint recorded on Polygon Amoy testnet.",
    image: "/landing-page-elements/upload-artwork.png",
    imageAlt: "Proof of authorship on blockchain",
    imagePosition: "center",
  },
  {
    title: "Visual Invariance",
    description:
      "Perceptual hashing detects visual duplicates even when cropped, scaled, or flipped.",
    image: "/landing-page-elements/similiarity-checking.png",
    imageAlt: "Similarity check results",
    imagePosition: "center",
  },
  {
    title: "Immutable History",
    description:
      "Every registered art piece has an auditable record that cannot be retroactively edited.",
    image: "/landing-page-elements/on-chain-record.png",
    imageAlt: "On-chain transaction logs",
    imagePosition: "center",
  },
];

export function evidenceCardBackground(card: EvidenceCard): string {
  return card.background ?? "#0f1013";
}
