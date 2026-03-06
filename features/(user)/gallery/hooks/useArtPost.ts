"use client";

import { useEffect, useRef, useState, useId } from "react";

/**
 * useArtPost is responsible for dropdown menu behavior.
 * We isolate this logic so the UI component (ArtPost) stays clean and readable.
 */
export function useArtPost() {
  // Unique ID for aria-controls relationship (good for accessibility)
  const menuId = useId();

  // Whether the "More" dropdown menu is open
  const [isOpen, setIsOpen] = useState(false);

  // References to elements so we can detect clicks outside the menu
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /**
     * Close menu when user clicks outside:
     * - if click is inside the button OR inside the menu, do nothing
     * - otherwise, close the menu
     */
    function handleClickOutside(e: MouseEvent) {
      if (!isOpen) return;

      const target = e.target as Node;

      // Clicked the toggle button -> ignore (ArtPost handles toggle logic)
      if (btnRef.current?.contains(target)) return;

      // Clicked inside the menu -> ignore (menu items handle their own clicks)
      if (menuRef.current?.contains(target)) return;

      // Clicked anywhere else -> close menu
      setIsOpen(false);
    }

    /**
     * Close menu when Escape key is pressed (expected behavior for menus/modals).
     */
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    // Attach global listeners while component is mounted
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup listeners to prevent memory leaks / duplicate listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]); // Re-run effect when open state changes (ensures logic uses latest isOpen)

  // Expose everything the component needs
  return {
    isOpen,
    setIsOpen,
    btnRef,
    menuRef,
    menuId,
  };
}