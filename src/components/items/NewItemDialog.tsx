"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { CREATABLE_ITEM_TYPES, createItem } from "@/lib/item-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ItemType = (typeof CREATABLE_ITEM_TYPES)[number];

const CONTENT_TYPES = new Set<ItemType>(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set<ItemType>(["snippet", "command"]);

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

export function NewItemDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ItemType>("snippet");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setType("snippet");
    setTitle("");
    setDescription("");
    setContent("");
    setLanguage("");
    setUrl("");
    setTags("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createItem({
        type,
        title,
        description,
        content: CONTENT_TYPES.has(type) ? content : "",
        language: LANGUAGE_TYPES.has(type) ? language : "",
        url: type === "link" ? url : "",
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Item created");
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button size="lg" />}>
        <Plus />
        New Item
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>
            Add a snippet, prompt, command, note, or link to your stash.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Type" htmlFor="new-item-type">
            <Select
              value={type}
              onValueChange={(value) => setType(value as ItemType)}
            >
              <SelectTrigger id="new-item-type" className="w-full capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREATABLE_ITEM_TYPES.map((itemType) => (
                  <SelectItem
                    key={itemType}
                    value={itemType}
                    className="capitalize"
                  >
                    {itemType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Title" htmlFor="new-item-title">
            <Input
              id="new-item-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>

          <Field label="Description" htmlFor="new-item-description">
            <Textarea
              id="new-item-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
            />
          </Field>

          {CONTENT_TYPES.has(type) ? (
            <Field label="Content" htmlFor="new-item-content">
              <Textarea
                id="new-item-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </Field>
          ) : null}

          {LANGUAGE_TYPES.has(type) ? (
            <Field label="Language" htmlFor="new-item-language">
              <Input
                id="new-item-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                placeholder="typescript"
              />
            </Field>
          ) : null}

          {type === "link" ? (
            <Field label="URL" htmlFor="new-item-url">
              <Input
                id="new-item-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                required
              />
            </Field>
          ) : null}

          <Field label="Tags" htmlFor="new-item-tags">
            <Input
              id="new-item-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="react, hooks"
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas.
            </p>
          </Field>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? "Creating…" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
