import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/security.server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("kinlive_session")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, session });
}
