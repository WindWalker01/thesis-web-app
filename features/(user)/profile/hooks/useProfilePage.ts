"use client";

import { useMemo, useState } from "react";
import { Artwork, ViewMode, ArtworkStatus, HashStatus } from "../types";

export function useProfilePage(artworks: Artwork[], sortOptions: readonly string[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ArtworkStatus | null>(null);
  const [selectedHash, setSelectedHash] = useState<HashStatus | null>(null);

  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  const [catOpen, setCatOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [hashOpen, setHashOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...artworks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((a) => a.category === selectedCategory);
    }

    if (selectedStatus) {
      list = list.filter((a) => a.status === selectedStatus);
    }

    if (selectedHash) {
      list = list.filter((a) => a.hashStatus === selectedHash);
    }

    switch (sortBy) {
      case "Oldest First":
        list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;

      case "Name A–Z":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "Name Z–A":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;

      case "Verified First":
        list.sort((a, b) => {
          if (a.ownershipStatus === b.ownershipStatus) return 0;
          return a.ownershipStatus === "verified" ? -1 : 1;
        });
        break;

      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return list;
  }, [
    artworks,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedHash,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (selectedHash ? 1 : 0);

  const clearAll = () => {
    setSelectedCategory(null);
    setSelectedStatus(null);
    setSelectedHash(null);
    setSearchQuery("");
  };

  return {
    filtered,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedHash,
    setSelectedHash,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    sidebarOpen,
    setSidebarOpen,
    sortOpen,
    setSortOpen,
    catOpen,
    setCatOpen,
    statusOpen,
    setStatusOpen,
    hashOpen,
    setHashOpen,
    activeFiltersCount,
    clearAll,
  };
}