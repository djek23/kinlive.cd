import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { addAudit, getAccountByEmail, getAccounts, saveAccounts } from "../../../lib/store.server";
import { isStrongPassword } from "../../../lib/security.server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !isStrongPassword(password)) {
    return NextResponse.json({ error: "Mot de passe requis : 12 caractères, majuscule, minuscule, chiffre et symbole." }, { status: 400 });
  }
  if (getAccountByEmail(email)) return NextResponse.json({ error: "Cette adresse est déjà utilisée." }, { status: 409 });

  const accounts = getAccounts();
  accounts.push({
    id: randomUUID(), name: String(body.name ?? "").trim(), email,
    phone: String(body.phone ?? "").trim(), passwordHash: await bcrypt.hash(password, 12),
    role: "producer", status: "pending", mustChangePassword: false, emailVerified: false,
    twoFactorEnabled: false, failedAttempts: 0, createdAt: new Date().toISOString(),
  });
  saveAccounts(accounts);
  addAudit("ACCOUNT_CREATED", `Création de dossier organisateur ${email}`, request.headers.get("x-forwarded-for") ?? "unknown", email);
  return NextResponse.json({ success: true, status: "pending" });
}
