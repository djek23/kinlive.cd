import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { isStrongPassword, verifySession } from "../../../lib/security.server";
import { addAudit, getAccountById, getAccounts, saveAccounts } from "../../../lib/store.server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session?.sub) return NextResponse.json({ error: "Session invalide." }, { status: 401 });

  const body = await request.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  if (!isStrongPassword(newPassword)) return NextResponse.json({ error: "Le nouveau mot de passe ne respecte pas la politique de sécurité." }, { status: 400 });

  const account = getAccountById(String(session.sub));
  if (!account) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (!(await bcrypt.compare(currentPassword, account.passwordHash))) return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });

  const newHash = await bcrypt.hash(newPassword, 12);
  saveAccounts(getAccounts().map((item) => item.id === account.id
    ? { ...item, passwordHash: newHash, mustChangePassword: false }
    : item));
  addAudit("PASSWORD_CHANGED", `Mot de passe modifié pour ${account.email}`, request.headers.get("x-forwarded-for") ?? "unknown", account.id);
  return NextResponse.json({ success: true });
}
