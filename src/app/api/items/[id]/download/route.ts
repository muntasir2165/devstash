import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";

/**
 * Streams an item's stored file back to its owner. Proxying avoids CORS and
 * keeps the bucket private; always sent as an attachment so script-capable
 * types (e.g. SVG) can never execute in our origin.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemDetail(id, session.user.id);
  if (!item?.fileUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const upstream = await fetch(item.fileUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "File unavailable" }, { status: 502 });
  }

  const fileName = (item.fileName ?? "download").replace(/["\\]/g, "");
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": upstream.headers.get("content-length") ?? "",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
