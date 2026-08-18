"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createItem } from "@/lib/item-actions";
import {
  CONTENT_ITEM_TYPES,
  CREATABLE_ITEM_TYPES,
  LANGUAGE_ITEM_TYPES,
  isUploadType,
  type CreatableItemType,
} from "@/lib/item-constants";
import { Button } from "@/components/ui/button";
import { FileUpload, type UploadedFile } from "./FileUpload";
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
import { Field } from "./Field";
import { ItemFormFields, type ItemFormValues } from "./ItemFormFields";

type ItemType = CreatableItemType;

const EMPTY_VALUES: ItemFormValues = {
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
};

export function NewItemDialog({
  defaultType = "snippet",
  label = "New Item",
}: {
  /** Preselects the type — used by the per-type item pages. */
  defaultType?: ItemType;
  label?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ItemType>(defaultType);
  const [values, setValues] = useState<ItemFormValues>(EMPTY_VALUES);
  const [upload, setUpload] = useState<UploadedFile | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function setField<K extends keyof ItemFormValues>(
    field: K,
    value: ItemFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function reset() {
    setType(defaultType);
    setValues(EMPTY_VALUES);
    setUpload(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createItem({
        type,
        title: values.title,
        description: values.description,
        content: CONTENT_ITEM_TYPES.has(type) ? values.content : "",
        language: LANGUAGE_ITEM_TYPES.has(type) ? values.language : "",
        url: type === "link" ? values.url : "",
        fileUrl: upload?.url ?? null,
        fileName: upload?.fileName ?? null,
        fileSize: upload?.fileSize ?? null,
        tags: values.tags
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
        {label}
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

          <ItemFormFields
            type={type}
            idPrefix="new-item"
            values={values}
            onChange={setField}
            urlRequired
            afterDescription={
              isUploadType(type) ? (
                <Field
                  label={type === "image" ? "Image" : "File"}
                  htmlFor="new-item-upload"
                >
                  <FileUpload kind={type} value={upload} onChange={setUpload} />
                </Field>
              ) : null
            }
          />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={
                pending || !values.title.trim() || (isUploadType(type) && !upload)
              }
            >
              {pending ? "Creating…" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
