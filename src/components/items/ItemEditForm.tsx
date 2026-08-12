"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { ItemDetail } from "@/lib/db/items";
import { updateItem } from "@/lib/item-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";

const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ItemEditForm({
  item,
  onCancel,
  onSaved,
}: {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}) {
  const typeName = item.type.name.toLowerCase();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [tags, setTags] = useState(item.tags.join(", "));
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateItem(item.id, {
        title,
        description,
        content: CONTENT_TYPES.has(typeName) ? content : item.content,
        language: LANGUAGE_TYPES.has(typeName) ? language : item.language,
        url: typeName === "link" ? url : item.url,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Item updated");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Title" htmlFor="item-title">
        <Input
          id="item-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </Field>

      <Field label="Description" htmlFor="item-description">
        <Textarea
          id="item-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
        />
      </Field>

      {CONTENT_TYPES.has(typeName) ? (
        <Field label="Content" htmlFor="item-content">
          {LANGUAGE_TYPES.has(typeName) ? (
            <CodeEditor
              value={content}
              language={language}
              onChange={setContent}
            />
          ) : (
            <MarkdownEditor value={content} onChange={setContent} />
          )}
        </Field>
      ) : null}

      {LANGUAGE_TYPES.has(typeName) ? (
        <Field label="Language" htmlFor="item-language">
          <Input
            id="item-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="typescript"
          />
        </Field>
      ) : null}

      {typeName === "link" ? (
        <Field label="URL" htmlFor="item-url">
          <Input
            id="item-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
          />
        </Field>
      ) : null}

      <Field label="Tags" htmlFor="item-tags">
        <Input
          id="item-tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="react, hooks"
        />
        <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
      </Field>

      <div className="flex items-center gap-2 border-t pt-4">
        <Button type="submit" disabled={pending || !title.trim()}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
