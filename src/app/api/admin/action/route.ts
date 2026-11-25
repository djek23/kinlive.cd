import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/security.server";
import { addAudit, getAccounts, saveAccounts } from "../../../lib/store.server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Accès superadministrateur requis." }, { status: 403 });

  const body = await request.json();
  const accountId = String(body.accountId ?? "");
  const action = String(body.action ?? "");
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const accounts = getAccounts();
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  if (action === "delete") {
    saveAccounts(accounts.filter((item) => item.id !== accountId));
    addAudit("ACCOUNT_DELETED", `Compte ${account.email} supprimé`, ip, String(session.sub));
    return NextResponse.json({ success: true });
  }
  if (!["active", "suspended", "pending"].includes(action)) return NextResponse.json({ error: "Action invalide." }, { status: 400 });

  const status = action as "active" | "suspended" | "pending";
  saveAccounts(accounts.map((item) => item.id === accountId ? { ...item, status } : item));
  addAudit(status === "active" ? "ACCOUNT_APPROVED" : "ACCOUNT_STATUS_CHANGED", `Compte ${account.email}: ${status}`, ip, String(session.sub));
  return NextResponse.json({ success: true, status });
}
