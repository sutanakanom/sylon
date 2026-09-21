"use client";

import { useState } from "react";
import styles from "../v2.module.css";

// A real (if small) piece of interactivity, not just a styled label: uses
// the Web Share sheet when the browser offers one (mobile Safari/Chrome),
// and falls back to copying the link with a short "Copied" confirmation
// otherwise. Kept deliberately simple — this V2 route is a visual
// experiment, so it doesn't reimplement the full join/comment stack.
export function V2ShareButton({
  title,
  text,
  variant = "primary",
  label = "Share this trip ↗",
}: {
  title: string;
  text: string;
  variant?: "primary" | "dark";
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Fall through to clipboard copy if the share sheet is dismissed
        // or unsupported for this call.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access denied — nothing more we can do quietly here.
    }
  }

  const className = variant === "dark" ? styles.btnDark : styles.btnPrimary;

  return (
    <button type="button" onClick={handleShare} className={className}>
      {copied ? "Copied ✓" : label}
    </button>
  );
}
