"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy } from "lucide-react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";

import { cn } from "@/lib/utils";

// Monaco is not SSR-safe and ships no "use client" directive.
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-[120px] w-full animate-pulse bg-[#0d0d11]" />,
});

/** Editor instance type, derived so we don't import the transitive monaco-editor package. */
type CodeEditorInstance = Parameters<OnMount>[0];

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

const THEME = "devstash-dark";

const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0d0d11",
      "editorGutter.background": "#0d0d11",
      "editorLineNumber.foreground": "#52525b",
      "editorLineNumber.activeForeground": "#a1a1aa",
      "scrollbarSlider.background": "#3f3f4680",
      "scrollbarSlider.hoverBackground": "#52525bb3",
      "scrollbarSlider.activeBackground": "#71717acc",
      "editorOverviewRuler.border": "#00000000",
    },
  });
};

function CopyCodeButton({ value }: { value: string }) {
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
      aria-label="Copy code"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function CodeEditor({
  value,
  language,
  readOnly = false,
  onChange,
  className,
}: {
  value: string;
  /** Free-text language from the item; falls back to plaintext. */
  language?: string | null;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [height, setHeight] = useState(MIN_HEIGHT);
  const resizingRef = useRef(false);

  const handleMount: OnMount = (editor: CodeEditorInstance) => {
    const resize = () => {
      // layout() re-fires the content-size event, so guard against re-entry.
      if (resizingRef.current) return;
      const next = Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, editor.getContentHeight()),
      );
      resizingRef.current = true;
      setHeight(next);
      editor.layout({ width: editor.getLayoutInfo().width, height: next });
      resizingRef.current = false;
    };

    editor.onDidContentSizeChange(resize);
    resize();
  };

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
          <span className="text-xs text-zinc-500">
            {language?.trim() || "plaintext"}
          </span>
          <CopyCodeButton value={value} />
        </div>
      </div>

      <Editor
        height={height}
        width="100%"
        theme={THEME}
        language={language?.trim() || "plaintext"}
        value={value}
        beforeMount={defineTheme}
        onMount={handleMount}
        onChange={(next) => onChange?.(next ?? "")}
        options={{
          readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: false },
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontSize: 13,
          wordWrap: "on",
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          contextmenu: false,
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 8,
            useShadows: false,
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </div>
  );
}
