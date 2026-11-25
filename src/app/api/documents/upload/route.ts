import path from "node:path";
import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { encryptBuffer, verifySession } from "../../../lib/security.server";
import { addAudit } from "../../../lib/store.server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: "Session invalide." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier requis." }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "PDF uniquement." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Taille maximale : 10 Mo." }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!buffer.subarray(0, 5).toString("ascii").startsWith("%PDF")) {
    return NextResponse.json({ error: "Signature PDF invalide." }, { status: 400 });
  }

  const directory = path.join(process.cwd(), "data", "documents", String(session.sub));
  fs.mkdirSync(directory, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  fs.writeFileSync(path.join(directory, `${Date.now()}-${safeName}.enc`), encryptBuffer(buffer));
  addAudit("DOCUMENT_UPLOADED", `PDF chiffré: ${safeName}`, request.headers.get("x-forwarded-for") ?? "unknown", String(session.sub));
  return NextResponse.json({ success: true, encrypted: true });
}
