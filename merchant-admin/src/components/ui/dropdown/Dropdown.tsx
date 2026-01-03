"use client";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  anchorEl?: HTMLElement | null;
  placement?: "bottom-end" | "bottom-start";
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  anchorEl,
  placement = "bottom-end",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; minWidth?: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const computePosition = () => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const gap = 8;

    // Start from bottom-end by default.
    let top = rect.bottom + gap;
    let left = rect.right;
    if (placement === "bottom-start") left = rect.left;

    // We'll adjust left once we know dropdown width (after render).
    setPos({ top, left, minWidth: rect.width });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    computePosition();
    // Reposition on scroll/resize so it stays attached to the button.
    const onScrollOrResize = () => computePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen, anchorEl, placement]);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !(event.target as HTMLElement).closest('.dropdown-toggle')
    ) {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [onClose]);


  if (!isOpen) return null;

  const content = (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        minWidth: pos.minWidth,
        transform: placement === "bottom-end" ? "translateX(-100%)" : undefined,
      }}
      className={`z-9999 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
    >
      {children}
    </div>
  );


  // If an anchor element is provided, render in a portal so it won't affect table layout/scroll.
  if (mounted && anchorEl) {
    return createPortal(content, document.body);
  }

  // Fallback: no anchor => render inline.
  return content;
};
