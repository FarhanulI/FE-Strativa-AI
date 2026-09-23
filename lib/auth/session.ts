// Server-only: reads/writes httpOnly auth cookies via next/headers and NextResponse.
// Do NOT import this file into a Client Component — it will fail the build.
import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "acs_access_token";
const REFRESH_TOKEN_COOKIE = "acs_refresh_token";

const isSecureCookie = process.env.COOKIE_SECURE !== "false";

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function refreshTokenMaxAgeSeconds(): number {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? "30");
  return days * 24 * 60 * 60;
}

export function setAuthCookies(response: NextResponse, tokens: AuthTokens): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: refreshTokenMaxAgeSeconds(),
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
