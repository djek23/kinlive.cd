import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/security.server";
import { getAudit } from "../../../lib/store.server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const session = await verifySession(token);
  if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  return NextResponse.json(getAudit());
}
