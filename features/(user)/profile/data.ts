import type { Artwork, Category, Profile } from "./types";

export const PROFILE: Profile = {
  name: "Nathaniel Pogi 123.",
  handle: "@nath_so_ugly",
  bio: "Digital artist specializing in concept art, sci-fi illustrations, and perceptual design. Protecting my creations with ArtForgeLab.",
  joinDate: "January 2026",
  totalArtworks: 12,
  totalScans: 8,
  verifiedCount: 10,
  initials: "NP",
};

export const CATEGORIES: Category[] = [
  { label: "Digital Paintings", img: "/landing-page-elements/starry-night.png" },
  { label: "Photography",       img: "/landing-page-elements/photography.png" },
  { label: "Illustrations",     img: "/landing-page-elements/digital-art.png" },
  { label: "NFTs",              img: "/landing-page-elements/art.png" },
  { label: "Graphic Designs",   img: "/landing-page-elements/graphic-design.png" },
  { label: "AI Art",            img: "/landing-page-elements/ai-image.png" },
];

export const SORT_OPTIONS = [
  "Recently Added",
  "Oldest First",
  "Name A–Z",
  "Name Z–A",
  "Verified First",
] as const;

export const ARTWORKS: Artwork[] = [
  { id: 1,  title: "Sunset Concept Art", category: "Digital Paintings", uploadDate: "Jan 10, 2026", ownershipStatus: "verified", hashStatus: "complete",   color: "from-orange-400 to-red-500",    img: "/landing-page-elements/starry-night.png" },
  { id: 2,  title: "Cyber Samurai",       category: "Illustrations",     uploadDate: "Jan 8, 2026",  ownershipStatus: "verified", hashStatus: "complete",   color: "from-blue-500 to-purple-600",   img: "/landing-page-elements/digital-art.png" },
  { id: 3,  title: "Digital Bloom",       category: "Photography",       uploadDate: "Jan 5, 2026",  ownershipStatus: "pending",  hashStatus: "complete",   color: "from-green-400 to-teal-500",    img: "/landing-page-elements/photography.png" },
  { id: 4,  title: "Abstract Waves",      category: "AI Art",            uploadDate: "Dec 28, 2025", ownershipStatus: "verified", hashStatus: "complete",   color: "from-indigo-400 to-blue-500",   img: "/landing-page-elements/ai-image.png" },
  { id: 5,  title: "Neon Cityscape",      category: "Graphic Designs",   uploadDate: "Dec 20, 2025", ownershipStatus: "verified", hashStatus: "complete",   color: "from-pink-500 to-orange-400",   img: "/landing-page-elements/graphic-design.png" },
  { id: 6,  title: "Forest Spirit",       category: "Digital Paintings", uploadDate: "Dec 15, 2025", ownershipStatus: "verified", hashStatus: "complete",   color: "from-emerald-400 to-green-600", img: "/landing-page-elements/starry-night.png" },
  { id: 7,  title: "Mech Warrior",        category: "Illustrations",     uploadDate: "Dec 10, 2025", ownershipStatus: "verified", hashStatus: "complete",   color: "from-slate-500 to-blue-600",    img: "/landing-page-elements/digital-art.png" },
  { id: 8,  title: "Cosmos Dream",        category: "NFTs",              uploadDate: "Dec 5, 2025",  ownershipStatus: "pending",  hashStatus: "processing", color: "from-violet-500 to-indigo-600", img: "/landing-page-elements/art.png" },
  { id: 9,  title: "Retro Wave",          category: "Graphic Designs",   uploadDate: "Nov 28, 2025", ownershipStatus: "verified", hashStatus: "complete",   color: "from-pink-400 to-purple-500",   img: "/landing-page-elements/graphic-design.png" },
  { id: 10, title: "Ancient Rune",        category: "NFTs",              uploadDate: "Nov 20, 2025", ownershipStatus: "verified", hashStatus: "complete",   color: "from-amber-400 to-orange-500",  img: "/landing-page-elements/art.png" },
  { id: 11, title: "Tech Interface",      category: "AI Art",            uploadDate: "Nov 15, 2025", ownershipStatus: "verified", hashStatus: "complete",   color: "from-cyan-400 to-blue-500",     img: "/landing-page-elements/ai-image.png" },
  { id: 12, title: "Dream Garden",        category: "Photography",       uploadDate: "Nov 10, 2025", ownershipStatus: "pending",  hashStatus: "complete",   color: "from-rose-400 to-pink-500",     img: "/landing-page-elements/photography.png" },
];