"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { ItemDetail } from "@/lib/db/items";
import {
  CONTENT_ITEM_TYPES,
  LANGUAGE_ITEM_TYPES,
} from "@/lib/item-constants";
import { updateItem } from "@/lib/item-actions";
import { Button } from "@/components/ui/button";
import { ItemFormFields, type ItemFormValues } from "./ItemFormFields";

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
  const [values, setValues] = useState<ItemFormValues>({
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.join(", "),
  });
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof ItemFormValues>(
    field: K,
    value: ItemFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateItem(item.id, {
        title: values.title,
        description: values.description,
        content: CONTENT_ITEM_TYPES.has(typeName)
          ? values.content
          : item.content,
        language: LANGUAGE_ITEM_TYPES.has(typeName)
          ? values.language
          : item.language,
        url: typeName === "link" ? values.url : item.url,
        tags: values.tags
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
      <ItemFormFields
        type={typeName}
        idPrefix="item"
        values={values}
        onChange={setField}
      />

      <div className="flex items-center gap-2 border-t pt-4">
        <Button type="submit" disabled={pending || !values.title.trim()}>
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
