export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  onboarding_status: "not_started" | "in_progress" | "completed";
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  workspace?: WorkspaceSummary;
}

export { ApiError } from "@/lib/api/errors";
