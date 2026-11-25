import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "../../lib/data.server";
import { addAudit } from "../../lib/store.server";

type Sale = {
  id: string; code: string; codeHash?: string; eventId: string; eventTitle: string; ticketType: string;
  customerName: string; phone: string; email: string; amount: number; currency: "USD" | "CDF";
  paymentMethod: string; status: "paid" | "pending" | "cancelled"; quantity: number;
  quantityRemaining: number; createdAt: string; producerId: string;
};

export async function GET(request: NextRequest) {
  const producerId = request.nextUrl.searchParams.get("producerId") ?? undefined;
  const sales = readJson<Sale[]>("sales.json", []);
  return NextResponse.json(producerId ? sales.filter((sale) => sale.producerId === producerId) : sales);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.eventId || !body.customerName || !body.amount) {
    return NextResponse.json({ error: "Informations vente incomplètes." }, { status: 400 });
  }
  const sales = readJson<Sale[]>("sales.json", []);
  const quantity = Math.max(1, Number(body.quantity ?? 1));
  const code = `KL-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const sale: Sale = {
    id: randomUUID(), code, codeHash: String(body.codeHash ?? ""), eventId: String(body.eventId),
    eventTitle: String(body.eventTitle ?? ""), ticketType: String(body.ticketType ?? "Standard"),
    customerName: String(body.customerName), phone: String(body.phone ?? ""), email: String(body.email ?? ""),
    amount: Number(body.amount), currency: body.currency === "CDF" ? "CDF" : "USD",
    paymentMethod: String(body.paymentMethod ?? "Orange Money"), status: "paid", quantity,
    quantityRemaining: quantity, createdAt: new Date().toISOString(), producerId: String(body.producerId ?? "gala-organizer"),
  };
  sales.unshift(sale);
  writeJson("sales.json", sales);
  addAudit("TICKET_SOLD", `Billet vendu pour ${sale.eventTitle}`, request.headers.get("x-forwarded-for") ?? "unknown");
  return NextResponse.json(sale, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });
  const sales = readJson<Sale[]>("sales.json", []);
  const updated = sales.map((sale) => sale.id === id ? { ...sale, status: "cancelled" as const } : sale);
  writeJson("sales.json", updated);
  addAudit("TICKET_CANCELLED", `Billet annulé: ${id}`, request.headers.get("x-forwarded-for") ?? "unknown");
  return NextResponse.json({ success: true });
}
