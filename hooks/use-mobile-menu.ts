"use client";

import { useEffect, useRef, useState } from "react";
import type { NavGroup } from "@/components/layout/navbar/mobile-menu.constants";

interface UseMobileMenuOptions {
  open: boolean;
  onClose: () => void;
}

export function useMobileMenu({ open, onClose }: UseMobileMenuOptions) {
  const [group, setGroup] = useState<NavGroup | null>(null);
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setGroup(null);
      previouslyFocusedRef.current?.focus();
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const scrollY = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  return { group, setGroup, mounted, closeButtonRef };
}
