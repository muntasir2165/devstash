"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Copy,
  FolderOpen,
  Pencil,
  Pin,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";

import type { ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { CodeEditor } from "./CodeEditor";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { ItemEditForm } from "./ItemEditForm";
import { MarkdownEditor } from "./MarkdownEditor";

/** Types whose content is code and renders in the Monaco editor. */
const CODE_TYPES = new Set(["snippet", "command"]);
/** Types whose content is markdown. */
const MARKDOWN_TYPES = new Set(["note", "prompt"]);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatSize(bytes: number | null) {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ItemDetailDrawer({
  itemId,
  open,
  onOpenChange,
}: {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Keyed by id so we never show a stale item while the next one loads, and so
  // all setState happens in async callbacks (not synchronously in the effect).
  const [loaded, setLoaded] = useState<{
    id: string;
    item: ItemDetail | null;
  } | null>(null);
  // Tracked by id so opening another item always starts back in view mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || !itemId) return;
    let cancelled = false;
    fetch(`/api/items/${itemId}`)
      .then((res) => (res.ok ? (res.json() as Promise<ItemDetail>) : null))
      .then((data) => {
        if (!cancelled) setLoaded({ id: itemId, item: data });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: itemId, item: null });
      });
    return () => {
      cancelled = true;
    };
  }, [open, itemId]);

  const item = loaded && loaded.id === itemId ? loaded.item : null;
  const loading = open && itemId != null && loaded?.id !== itemId;
  const editing = item != null && editingId === item.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        {/* Base UI's Dialog needs a title for accessibility in every state. */}
        <SheetTitle className="sr-only">
          {item?.title ?? "Item details"}
        </SheetTitle>
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          editing ? (
            <div className="p-5">
              <ItemEditForm
                item={item}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  setLoaded({ id: updated.id, item: updated });
                  setEditingId(null);
                  // Keep the underlying card list in sync with the edit.
                  router.refresh();
                }}
              />
            </div>
          ) : (
            <DrawerBody
              item={item}
              onEdit={() => setEditingId(item.id)}
              onDeleted={() => {
                onOpenChange(false);
                router.refresh();
              }}
            />
          )
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            Couldn&apos;t load this item.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  item,
  onEdit,
  onDeleted,
}: {
  item: ItemDetail;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const size = formatSize(item.fileSize);
  const copyText = item.content ?? item.url ?? "";

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-start gap-3 pr-8">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <TypeIcon icon={item.type.icon} color={item.type.color} />
        </div>
        <div className="min-w-0 space-y-1.5">
          <h2 className="truncate text-lg font-semibold">{item.title}</h2>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="capitalize">
              {item.type.name}
            </Badge>
            {item.language ? (
              <Badge variant="secondary">{item.language}</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-y py-1">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Star
            className={cn(
              "size-4",
              item.isFavorite && "fill-yellow-400 text-yellow-400",
            )}
          />
          Favorite
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Pin className={cn("size-4", item.isPinned && "fill-current")} />
          Pin
        </Button>
        <CopyButton text={copyText} />
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <DeleteItemDialog
            itemId={item.id}
            itemTitle={item.title}
            onDeleted={onDeleted}
          />
        </div>
      </div>

      {item.description ? (
        <Section label="Description">
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </Section>
      ) : null}

      {item.url ? (
        <Section label="URL">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all text-primary underline underline-offset-2"
          >
            {item.url}
          </a>
        </Section>
      ) : item.fileUrl ? (
        <Section label="File">
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all text-primary underline underline-offset-2"
          >
            {item.fileName ?? "Download file"}
          </a>
          {size ? (
            <span className="ml-2 text-xs text-muted-foreground">{size}</span>
          ) : null}
        </Section>
      ) : item.content ? (
        <Section label="Content">
          {CODE_TYPES.has(item.type.name.toLowerCase()) ? (
            <CodeEditor value={item.content} language={item.language} readOnly />
          ) : MARKDOWN_TYPES.has(item.type.name.toLowerCase()) ? (
            <MarkdownEditor value={item.content} readOnly />
          ) : (
            <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
              <code>{item.content}</code>
            </pre>
          )}
        </Section>
      ) : null}

      {item.tags.length > 0 ? (
        <Section label="Tags" icon={Tag}>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {item.collections.length > 0 ? (
        <Section label="Collections" icon={FolderOpen}>
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((collection) => (
              <Badge key={collection.id} variant="secondary">
                {collection.name}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      <Section label="Details" icon={Calendar}>
        <dl className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(item.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{formatDate(item.updatedAt)}</dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}

function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      {children}
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5"
      disabled={!text}
      onClick={() => {
        if (!text) return;
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <Copy className="size-4" />
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
