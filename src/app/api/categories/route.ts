import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../lib/security.server";
import { readJson, writeJson } from "../../lib/data.server";

const defaults = ["Concert", "Festival", "Conférence", "Match", "Culte", "Comédie"];

export async function GET() {
  return NextResponse.json(readJson<string[]>("categories.json", defaults));
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session || !["producer", "superadmin"].includes(String(session.role))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const body = await request.json();
  if (!Array.isArray(body.categories)) return NextResponse.json({ error: "Liste invalide." }, { status: 400 });
  const categories = Array.from(new Set(body.categories.map((item: unknown) => String(item).trim()).filter(Boolean)));
  writeJson("categories.json", categories);
  return NextResponse.json(categories);
}
