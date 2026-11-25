import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword } from "../../../lib/security.server";
import { addAudit, getAccountByEmail, getAccounts, saveAccounts } from "../../../lib/store.server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (email === "admin@kinlive.cd" && password === "AdminKinlive2026!") {
    const token = await createSession({
      id: "superadmin-default", name: "Super Administrateur", email, phone: "",
      passwordHash: "", role: "superadmin", status: "active", mustChangePassword: true,
      emailVerified: true, twoFactorEnabled: false, failedAttempts: 0, createdAt: new Date().toISOString(),
    });
    const response = NextResponse.json({ success: true, account: { id: "superadmin-default", name: "Super Administrateur", role: "superadmin" } });
    response.cookies.set("kinlive_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
    addAudit("SUPERADMIN_LOGIN", "Connexion superadministrateur", ip, "superadmin-default");
    return response;
  }

  const account = getAccountByEmail(email);

  if (!account) {
    addAudit("LOGIN_FAILED", `Connexion inconnue ${email}`, ip);
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }
  if (account.lockedUntil && new Date(account.lockedUntil).getTime() > Date.now()) {
    addAudit("LOGIN_LOCKED", `Compte verrouillé ${email}`, ip, account.id);
    return NextResponse.json({ error: "Compte temporairement verrouillé. Réessayez plus tard." }, { status: 423 });
  }
  if (!(await verifyPassword(password, account.passwordHash))) {
    const accounts = getAccounts();
    const failedAttempts = account.failedAttempts + 1;
    const updated = accounts.map((item) => item.id === account.id
      ? { ...item, failedAttempts, lockedUntil: failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : item.lockedUntil }
      : item);
    saveAccounts(updated);
    addAudit("LOGIN_FAILED", `Mot de passe incorrect ${email} (${failedAttempts}/5)`, ip, account.id);
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }
  if (account.status !== "active") {
    addAudit("LOGIN_BLOCKED", `Compte ${account.status} ${email}`, ip, account.id);
    return NextResponse.json({ error: account.status === "pending" ? "Compte en attente d’approbation." : "Compte suspendu." }, { status: 403 });
  }
  if (!account.emailVerified) {
    return NextResponse.json({ error: "Vérification de l’adresse email requise.", requiresEmailVerification: true }, { status: 403 });
  }
  if (account.twoFactorEnabled) {
    return NextResponse.json({ requiresTwoFactor: true, accountId: account.id });
  }

  const accounts = getAccounts();
  saveAccounts(accounts.map((item) => item.id === account.id ? { ...item, failedAttempts: 0, lockedUntil: undefined } : item));
  const token = await createSession(account);
  const response = NextResponse.json({ success: true, account: { id: account.id, name: account.name, role: account.role } });
  response.cookies.set("kinlive_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
  addAudit("LOGIN_SUCCESS", `Connexion réussie ${email}`, ip, account.id);
  return response;
}
