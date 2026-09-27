import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api/backend-client";
import { clearAuthCookies, getAccessToken, getRefreshToken } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";

export async function POST() {
  const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);

  // The backend requires both a Bearer access token and a refresh_token body field.
  // If either cookie is already gone there is nothing to authenticate the
  // revocation with, so skip the call and just clear cookies locally.
  if (accessToken && refreshToken) {
    try {
      await serverFetch("/api/v1/auth/logout", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.warn("[auth/logout] backend logout failed; clearing cookies anyway", {
        status: error instanceof ApiError ? error.status : null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // A logout must never leave the user "logged in" client-side, whatever the backend said.
  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
