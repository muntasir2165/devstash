"use client";

import type { ReactNode } from "react";

import {
  CONTENT_ITEM_TYPES,
  LANGUAGE_ITEM_TYPES,
} from "@/lib/item-constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "./CodeEditor";
import { Field } from "./Field";
import { MarkdownEditor } from "./MarkdownEditor";

export interface ItemFormValues {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

/**
 * The item fields shared by the create dialog and the drawer's edit form.
 * `idPrefix` keeps input ids unique when both are mounted.
 */
export function ItemFormFields({
  type,
  idPrefix,
  values,
  onChange,
  urlRequired = false,
  afterDescription,
}: {
  type: string;
  idPrefix: string;
  values: ItemFormValues;
  onChange: <K extends keyof ItemFormValues>(
    field: K,
    value: ItemFormValues[K],
  ) => void;
  urlRequired?: boolean;
  /** Slot for create-only fields (the file/image upload) that sit mid-form. */
  afterDescription?: ReactNode;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <Field label="Title" htmlFor={id("title")}>
        <Input
          id={id("title")}
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          required
        />
      </Field>

      <Field label="Description" htmlFor={id("description")}>
        <Textarea
          id={id("description")}
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={2}
        />
      </Field>

      {afterDescription}

      {CONTENT_ITEM_TYPES.has(type) ? (
        <Field label="Content" htmlFor={id("content")}>
          {LANGUAGE_ITEM_TYPES.has(type) ? (
            <CodeEditor
              value={values.content}
              language={values.language}
              onChange={(value) => onChange("content", value)}
            />
          ) : (
            <MarkdownEditor
              value={values.content}
              onChange={(value) => onChange("content", value)}
            />
          )}
        </Field>
      ) : null}

      {LANGUAGE_ITEM_TYPES.has(type) ? (
        <Field label="Language" htmlFor={id("language")}>
          <Input
            id={id("language")}
            value={values.language}
            onChange={(event) => onChange("language", event.target.value)}
            placeholder="typescript"
          />
        </Field>
      ) : null}

      {type === "link" ? (
        <Field label="URL" htmlFor={id("url")}>
          <Input
            id={id("url")}
            type="url"
            value={values.url}
            onChange={(event) => onChange("url", event.target.value)}
            placeholder="https://example.com"
            required={urlRequired}
          />
        </Field>
      ) : null}

      <Field label="Tags" htmlFor={id("tags")}>
        <Input
          id={id("tags")}
          value={values.tags}
          onChange={(event) => onChange("tags", event.target.value)}
          placeholder="react, hooks"
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas.
        </p>
      </Field>
    </>
  );
}
