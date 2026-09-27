import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api/backend-client";
import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";
import type { TokenResponse } from "@/features/auth/types";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = await serverFetch<TokenResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // The browser only needs to know the cookies were rotated, never the token values.
    const response = NextResponse.json({ ok: true }, { status: 200 });

    setAuthCookies(response, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const response = NextResponse.json(error.body, { status: error.status });
      // Refresh token is invalid/expired/already rotated — the session is dead, so
      // don't leave stale cookies behind.
      if (error.status === 401) {
        clearAuthCookies(response);
      }
      return response;
    }

    return NextResponse.json(
      { detail: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
