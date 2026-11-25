import { NextRequest, NextResponse } from "next/server";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { createSession } from "../../../lib/security.server";
import { addAudit, getAccountById, getAccounts, saveAccounts } from "../../../lib/store.server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const accountId = String(body.accountId ?? "");
  const account = getAccountById(accountId);
  if (!account) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  if (body.action === "setup") {
    const secret = generateSecret();
    const uri = generateURI({ issuer: "Kinlive", label: account.email, secret });
    const qrCode = await QRCode.toDataURL(uri);
    return NextResponse.json({ secret, qrCode });
  }

  if (body.action === "activate") {
    const secret = String(body.secret ?? "");
    const code = String(body.code ?? "");
    const result = await verify({ secret, token: code });
    if (!result.valid) return NextResponse.json({ error: "Code 2FA invalide." }, { status: 401 });
    saveAccounts(getAccounts().map((item) => item.id === accountId ? { ...item, twoFactorEnabled: true, twoFactorSecret: secret } : item));
    addAudit("2FA_ACTIVATED", `2FA activée pour ${account.email}`, request.headers.get("x-forwarded-for") ?? "unknown", accountId);
    return NextResponse.json({ success: true });
  }

  if (body.action === "verify") {
    if (!account.twoFactorSecret) return NextResponse.json({ error: "2FA non configurée." }, { status: 400 });
    const result = await verify({ secret: account.twoFactorSecret, token: String(body.code ?? "") });
    if (!result.valid) return NextResponse.json({ error: "Code 2FA invalide." }, { status: 401 });
    const token = await createSession(account);
    const response = NextResponse.json({ success: true });
    response.cookies.set("kinlive_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
    addAudit("LOGIN_SUCCESS_2FA", `Connexion 2FA réussie ${account.email}`, request.headers.get("x-forwarded-for") ?? "unknown", accountId);
    return response;
  }

  return NextResponse.json({ error: "Action invalide." }, { status: 400 });
}
