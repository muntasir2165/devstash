"use client";

import {
  Download,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  Pin,
  Star,
} from "lucide-react";

import type { ItemSummary } from "@/lib/db/items";
import { formatBytes, formatDate } from "@/lib/utils";
import { useItemDrawer } from "./ItemDrawerProvider";

/**
 * Icon chosen by file extension. Uses a switch rather than a lookup map so no
 * component is created during render (React Compiler `static-components`).
 */
function FileTypeIcon({ fileName }: { fileName: string | null }) {
  const props = { className: "size-4 text-muted-foreground" };
  switch (fileName?.split(".").pop()?.toLowerCase()) {
    case "pdf":
    case "txt":
    case "md":
    case "ini":
      return <FileText {...props} />;
    case "json":
      return <FileJson {...props} />;
    case "yaml":
    case "yml":
    case "xml":
    case "toml":
      return <FileCode {...props} />;
    case "csv":
      return <FileSpreadsheet {...props} />;
    default:
      return <FileIcon {...props} />;
  }
}

/**
 * A Drive-style file row. Deliberately not wrapped in `ItemCardTrigger`: the
 * download control must sit outside a <button> to keep the markup valid.
 */
export function FileRow({ item }: { item: ItemSummary }) {
  const { openItem } = useItemDrawer();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItem(item.id);
        }
      }}
      className="flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-row sm:items-center sm:gap-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileTypeIcon fileName={item.fileName} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{item.title}</span>
            {item.isPinned && (
              <Pin className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            {item.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          {item.fileName ? (
            <p className="truncate text-xs text-muted-foreground">
              {item.fileName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3 pl-12 sm:pl-0">
        <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">
          {item.fileSize != null ? formatBytes(item.fileSize) : "—"}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDate(item.createdAt, "medium")}
        </span>
        <a
          href={`/api/items/${item.id}/download`}
          download
          aria-label={`Download ${item.fileName ?? item.title}`}
          // Row click opens the drawer; the download must not also trigger it.
          onClick={(event) => event.stopPropagation()}
          className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:ml-0"
        >
          <Download className="size-4" />
        </a>
      </div>
    </div>
  );
}
