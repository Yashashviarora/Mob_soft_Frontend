import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Server-side calls stay inside the Docker network (API_INTERNAL_URL); browser
// calls use NEXT_PUBLIC_API_URL (baked in at build time). Falls back to the
// public URL so this still works in setups without an internal network.
const API_BASE_URL =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const COOKIE_NAME = "shop_token";

// Reads the httpOnly JWT cookie server-side and hands back {token, user} to
// the client, which cannot read httpOnly cookies itself. This also doubles
// as token validation: /auth/me will 401 if the token is expired/invalid.
export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "No active session" }, { status: 401 });
  }

  let backendRes;
  try {
    backendRes = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Could not reach the backend server" },
      { status: 502 }
    );
  }

  if (!backendRes.ok) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 });
  }

  const user = await backendRes.json();
  return NextResponse.json({ token, user });
}
