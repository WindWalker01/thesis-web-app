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