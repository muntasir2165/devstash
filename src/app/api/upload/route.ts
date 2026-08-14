import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  buildObjectKey,
  r2Configured,
  uploadToR2,
  validateUpload,
  type UploadKind,
} from "@/lib/r2";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!r2Configured) {
    return NextResponse.json(
      { error: "File storage isn't configured." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (kind !== "image" && kind !== "file") {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  const validation = validateUpload(kind as UploadKind, {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const key = buildObjectKey(session.user.id, file.name);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const url = await uploadToR2(key, bytes, file.type);

  return NextResponse.json({
    url,
    fileName: file.name,
    fileSize: file.size,
  });
}
