import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../lib/security.server";
import { readJson, writeJson } from "../../lib/data.server";

type Provider = { id: "orange" | "airtel" | "mpesa" | "card"; name: string; enabled: boolean; publicKey: string; secretKey: string; webhookUrl: string };

const defaults: Provider[] = [
  { id: "orange", name: "Orange Money", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
  { id: "airtel", name: "Airtel Money", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
  { id: "mpesa", name: "M-Pesa", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
  { id: "card", name: "Carte bancaire", enabled: false, publicKey: "", secretKey: "", webhookUrl: "" },
];

export async function GET() {
  const providers = readJson<Provider[]>("payments.json", defaults);
  return NextResponse.json(providers.map(({ secretKey, webhookUrl, ...provider }) => ({ ...provider, configured: Boolean(secretKey), webhookConfigured: Boolean(webhookUrl) })));
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Accès superadministrateur requis." }, { status: 403 });
  const body = await request.json();
  if (!Array.isArray(body.providers)) return NextResponse.json({ error: "Configuration invalide." }, { status: 400 });
  writeJson("payments.json", body.providers);
  return NextResponse.json({ success: true });
}
