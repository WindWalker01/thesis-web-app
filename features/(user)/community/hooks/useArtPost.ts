"use client";

import { useEffect, useRef, useState, useId } from "react";

export function useArtPost() {
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isOpen) return;

      const target = e.target as Node;

      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setIsOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        btnRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    btnRef,
    menuRef,
    menuId,
  };
}