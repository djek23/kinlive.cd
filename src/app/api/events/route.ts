import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { verifySession } from "../../lib/security.server";
import { readJson, writeJson } from "../../lib/data.server";
import { addAudit } from "../../lib/store.server";

type EventRecord = {
  id: string; title: string; place: string; date: string; time: string; price: string;
  category: string; image: string; producerId: string; status: "pending" | "published";
  description: string; liveStatus?: "offline" | "live" | "ended"; eventDate?: string;
};

export async function GET(request: NextRequest) {
  const producerId = request.nextUrl.searchParams.get("producerId") ?? undefined;
  const events = readJson<EventRecord[]>("events.json", []);
  return NextResponse.json(producerId ? events.filter((event) => event.producerId === producerId) : events);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session || session.role !== "producer") return NextResponse.json({ error: "Compte organisateur requis." }, { status: 403 });

  const body = await request.json();
  if (!body.title || !body.place || !body.eventDate) return NextResponse.json({ error: "Informations événement incomplètes." }, { status: 400 });
  const events = readJson<EventRecord[]>("events.json", []);
  const event: EventRecord = {
    id: randomUUID(), title: String(body.title), place: String(body.place), date: String(body.date),
    time: String(body.time), price: String(body.price), category: String(body.category), image: String(body.image),
    producerId: String(session.sub), status: "pending", description: String(body.description ?? ""), eventDate: String(body.eventDate),
  };
  events.unshift(event);
  writeJson("events.json", events);
  addAudit("EVENT_CREATED", `Événement créé: ${event.title}`, request.headers.get("x-forwarded-for") ?? "unknown", String(session.sub));
  return NextResponse.json(event, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  const body = await request.json();
  const events = readJson<EventRecord[]>("events.json", []);
  const found = events.find((event) => event.id === body.id);
  if (!found) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  if (session.role !== "superadmin" && found.producerId !== session.sub) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const updated = events.map((event) => event.id === body.id ? { ...event, ...body, id: event.id, producerId: event.producerId } : event);
  writeJson("events.json", updated);
  addAudit("EVENT_UPDATED", `Événement modifié: ${found.title}`, request.headers.get("x-forwarded-for") ?? "unknown", String(session.sub));
  return NextResponse.json(updated.find((event) => event.id === body.id));
}
