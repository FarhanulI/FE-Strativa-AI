export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export type Goal = "growth" | "authority" | "engagement" | "community";

export interface BasicsResponse {
  user_name: string;
  workspace_name: string;
  logo_url?: string;
}
export type BasicsRequest = BasicsResponse;

export interface LogoUploadResponse {
  logo_url: string;
}

export interface IdentityResponse {
  positioning: string;
  primary_niche: string;
  topics: string[];
  expertise: string[];
}
export type IdentityRequest = IdentityResponse;

export interface AudienceResponse {
  target_audience_description: string;
  interests: string[];
  pain_points: string[];
  questions: string[];
}
export type AudienceRequest = AudienceResponse;

export interface BrandResponse {
  tone: string[];
  style: string;
  things_to_avoid: string[];
}
export type BrandRequest = BrandResponse;

export interface GoalsResponse {
  goals: Goal[];
}
export type GoalsRequest = GoalsResponse;

export interface OnboardingState {
  onboarding_status: OnboardingStatus;
  basics: BasicsResponse | null;
  identity: IdentityResponse | null;
  audience: AudienceResponse | null;
  goals: GoalsResponse | null;
  brand: BrandResponse | null;
}

export interface CompleteResponse {
  onboarding_status: OnboardingStatus;
  profile: Record<string, unknown>;
}
