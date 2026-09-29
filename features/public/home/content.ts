export type ProductStackStep = {
  title: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
};

export type TeamMember = {
  name: string;
  role: string;
  img: string;
  portfolio?: string;
};

export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    name: "Ruzzel",
    role: "Lead Developer",
    img: "/team-image/ruzzel.png",
    portfolio: "https://ruzzel.vercel.app",
  },
  {
    name: "Tenshin",
    role: "Front/Backend Engineer",
    img: "/team-image/tenshin.jpg",
    portfolio: "https://tenshinponteres.dev",
  },
  {
    name: "Nathaniel",
    role: "UI/UX Designer",
    img: "/team-image/nathanielSD.jpg",
  },
];

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
