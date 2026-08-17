"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/** Quick-copy control for cards. Stops propagation so it doesn't open the drawer. */
export function CardCopyButton({
  value,
  className,
}: {
  value: string | null;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  return (
    <button
      type="button"
      aria-label="Copy content"
      onClick={(event) => {
        event.stopPropagation();
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}
