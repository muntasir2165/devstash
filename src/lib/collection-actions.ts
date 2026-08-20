"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  type CollectionSummary,
} from "@/lib/db/collections";

// Empty inputs come back from the form as "" — treat them as "no value".
const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  // Absent and blank both mean "no description".
  description: z.preprocess(
    emptyToNull,
    z.string().trim().nullable().default(null),
  ),
});

export type CreateCollectionInput = z.input<typeof createCollectionSchema>;

export type CreateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

/** Create a collection owned by the signed-in user. */
export async function createCollection(
  input: CreateCollectionInput,
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = createCollectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: z.prettifyError(parsed.error) };
  }

  const collection = await createCollectionQuery(session.user.id, parsed.data);
  return { success: true, data: collection };
}
