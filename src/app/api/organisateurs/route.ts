import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../lib/security.server";
import { getAccounts } from "../../lib/store.server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Accès superadministrateur requis." }, { status: 403 });

  const producers = getAccounts().filter((account) => account.role === "producer").map((account) => ({
    id: account.id, name: account.name, email: account.email, phone: account.phone,
    role: account.role, status: account.status, ownerName: account.ownerName,
    city: account.city, country: account.country, rccm: account.rccm,
    identityNumber: account.identityNumber, emailVerified: account.emailVerified,
    twoFactorEnabled: account.twoFactorEnabled, createdAt: account.createdAt,
  }));
  return NextResponse.json(producers);
}
