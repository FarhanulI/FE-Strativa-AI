import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api/backend-client";
import { setAuthCookies } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";
import type { LoginRequest, TokenResponse } from "@/features/auth/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginRequest;

    const data = await serverFetch<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = NextResponse.json({ workspace: data.workspace ?? null }, { status: 200 });

    setAuthCookies(response, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }

    return NextResponse.json(
      { detail: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
