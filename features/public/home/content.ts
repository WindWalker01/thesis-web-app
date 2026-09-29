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

export type HomeFaq = {
  q: string;
  a: string;
  open?: boolean;
};

export const HOME_FAQS: readonly HomeFaq[] = [
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
