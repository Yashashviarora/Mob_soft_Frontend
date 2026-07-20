import { NextResponse } from "next/server";

// Server-side calls stay inside the Docker network (API_INTERNAL_URL); browser
// calls use NEXT_PUBLIC_API_URL (baked in at build time). Falls back to the
// public URL so this still works in setups without an internal network.
const API_BASE_URL =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const COOKIE_NAME = "shop_token";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 }
    );
  }

  let backendRes;
  try {
    backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Could not reach the backend server" },
      { status: 502 }
    );
  }

  if (!backendRes.ok) {
    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { message: data?.detail || "Invalid username or password" },
      { status: backendRes.status }
    );
  }

  const data = await backendRes.json();

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(COOKIE_NAME, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
