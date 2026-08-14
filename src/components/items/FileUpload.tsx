"use client";

import { useRef, useState } from "react";
import { File as FileIcon, Loader2, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type UploadedFile = {
  url: string;
  fileName: string;
  fileSize: number;
};

const ACCEPT: Record<"image" | "file", string> = {
  image: "image/png,image/jpeg,image/gif,image/webp,image/svg+xml",
  file: "application/pdf,text/plain,text/markdown,application/json,application/x-yaml,text/yaml,application/xml,text/xml,text/csv,application/toml,.yaml,.yml,.toml,.ini,.md,.csv",
};

const MAX_LABEL: Record<"image" | "file", string> = {
  image: "PNG, JPG, GIF, WEBP or SVG · up to 5 MB",
  file: "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML or INI · up to 10 MB",
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  kind,
  value,
  onChange,
}: {
  kind: "image" | "file";
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function upload(file: File) {
    setError(null);
    setProgress(0);

    // XHR (not fetch) so we can report real upload progress.
    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      setProgress(null);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          onChange(data as UploadedFile);
        } else {
          setError(data?.error ?? "Upload failed.");
        }
      } catch {
        setError("Upload failed.");
      }
    });
    xhr.addEventListener("error", () => {
      setProgress(null);
      setError("Upload failed.");
    });
    xhr.send(body);
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-3">
        {kind === "image" ? (
          // Remote R2 host isn't in next.config images — plain img is intentional.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.url}
            alt={value.fileName}
            className="size-14 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded bg-muted">
            <FileIcon className="size-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{value.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(value.fileSize)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove file"
          onClick={() => onChange(null)}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-1.5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) upload(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/40",
          dragging && "border-primary bg-muted/40",
        )}
      >
        {progress === null ? (
          <Upload className="size-5 text-muted-foreground" />
        ) : (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        )}
        <p className="text-sm">
          {progress === null
            ? "Drag and drop, or click to choose"
            : `Uploading… ${progress}%`}
        </p>
        <p className="text-xs text-muted-foreground">{MAX_LABEL[kind]}</p>

        {progress !== null ? (
          <div className="mt-1 h-1 w-full overflow-hidden rounded bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          if (picked) upload(picked);
          event.target.value = "";
        }}
      />

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
