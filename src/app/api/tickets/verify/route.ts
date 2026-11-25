import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "../../../lib/data.server";
import { addAudit } from "../../../lib/store.server";

type Sale = { id: string; code: string; codeHash?: string; eventId: string; status: string; quantityRemaining?: number; quantity?: number };

export async function POST(request: NextRequest) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const eventId = String(body.eventId ?? "");
  if (!code || !eventId) return NextResponse.json({ valid: false, reason: "Code ou événement requis." }, { status: 400 });

  const hash = createHash("sha256").update(code).digest("hex");
  const sales = readJson<Sale[]>("sales.json", []);
  const ticket = sales.find((sale) => sale.status === "paid" && (sale.code === code || sale.codeHash === hash));
  if (!ticket) return NextResponse.json({ valid: false, reason: "Billet invalide ou annulé." }, { status: 404 });
  if (ticket.eventId !== eventId) return NextResponse.json({ valid: false, reason: "Billet associé à un autre événement." }, { status: 409 });

  const remaining = ticket.quantityRemaining ?? ticket.quantity ?? 1;
  if (remaining <= 0) return NextResponse.json({ valid: false, reason: "Billet déjà utilisé." }, { status: 409 });

  writeJson("sales.json", sales.map((sale) => sale.id === ticket.id
    ? { ...sale, quantityRemaining: remaining - 1 }
    : sale));
  addAudit("TICKET_VERIFIED", `Billet vérifié: ${code}`, request.headers.get("x-forwarded-for") ?? "unknown");
  return NextResponse.json({ valid: true, remaining: remaining - 1 });
}
