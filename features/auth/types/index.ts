export interface RegisterRequest {
  email: string;
  password: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  workspace?: WorkspaceSummary;
}

export { ApiError } from "@/lib/api/errors";
