"use client";

import { Download } from "lucide-react";

import type { ItemDetail } from "@/lib/db/items";
import {
  LANGUAGE_ITEM_TYPES,
  MARKDOWN_ITEM_TYPES,
} from "@/lib/item-constants";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "./CodeEditor";
import { DrawerSection } from "./DrawerSection";
import { MarkdownEditor } from "./MarkdownEditor";

/** Renders whichever body an item has: a URL, an uploaded file, or text content. */
export function ItemContentSection({ item }: { item: ItemDetail }) {
  const typeName = item.type.name.toLowerCase();

  if (item.url) {
    return (
      <DrawerSection label="URL">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm break-all text-primary underline underline-offset-2"
        >
          {item.url}
        </a>
      </DrawerSection>
    );
  }

  if (item.fileUrl) {
    const size = item.fileSize == null ? null : formatBytes(item.fileSize);
    return (
      <DrawerSection label={typeName === "image" ? "Image" : "File"}>
        {typeName === "image" ? (
          // Remote R2 host isn't configured in next.config images — plain img is intentional.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fileUrl}
            alt={item.fileName ?? item.title}
            className="max-h-64 w-full rounded-lg border object-contain"
          />
        ) : null}
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            nativeButton={false}
            render={<a href={`/api/items/${item.id}/download`} download />}
          >
            <Download className="size-4" />
            Download
          </Button>
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {item.fileName}
            {size ? ` · ${size}` : ""}
          </span>
        </div>
      </DrawerSection>
    );
  }

  if (!item.content) return null;

  return (
    <DrawerSection label="Content">
      {LANGUAGE_ITEM_TYPES.has(typeName) ? (
        <CodeEditor value={item.content} language={item.language} readOnly />
      ) : MARKDOWN_ITEM_TYPES.has(typeName) ? (
        <MarkdownEditor value={item.content} readOnly />
      ) : (
        <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
          <code>{item.content}</code>
        </pre>
      )}
    </DrawerSection>
  );
}
