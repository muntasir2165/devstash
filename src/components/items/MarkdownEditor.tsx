"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MIN_HEIGHT = 320;
const MAX_HEIGHT = 400;

/** Grow the textarea with its content, clamped — sized on the element so no re-render is needed. */
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, el.scrollHeight))}px`;
}

function CopyMarkdownButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (!value) return;
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
      aria-label="Copy markdown"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Markdown preview. HTML in the source stays escaped — do not add rehype-raw. */
function Preview({ value }: { value: string }) {
  return (
    <div className="markdown-preview">
      {value.trim() ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      ) : (
        <p className="text-zinc-500 italic">Nothing to preview.</p>
      )}
    </div>
  );
}

export function MarkdownEditor({
  value,
  readOnly = false,
  onChange,
  className,
}: {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}) {
  // Readonly renders preview only — no tab chrome needed.
  if (readOnly) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-[#0d0d11]",
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-500">markdown</span>
            <CopyMarkdownButton value={value} />
          </div>
        </div>
        <div
          className="themed-scrollbar overflow-y-auto p-4"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          <Preview value={value} />
        </div>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="write"
      className={cn(
        "gap-0 overflow-hidden rounded-lg border bg-[#0d0d11]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <TabsList className="h-7 bg-zinc-800/60">
          <TabsTrigger value="write" className="text-xs">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            Preview
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500">markdown</span>
          <CopyMarkdownButton value={value} />
        </div>
      </div>

      <TabsContent value="write">
        <textarea
          ref={autosize}
          value={value}
          onChange={(event) => {
            autosize(event.currentTarget);
            onChange?.(event.target.value);
          }}
          spellCheck={false}
          className="themed-scrollbar w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600"
          style={{ height: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
          placeholder="Write markdown…"
        />
      </TabsContent>

      <TabsContent value="preview">
        <div
          className="themed-scrollbar overflow-y-auto p-4"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          <Preview value={value} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
