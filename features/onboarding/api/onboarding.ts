import { clientFetch } from "@/lib/api/browser-client";
import type {
  AudienceRequest,
  AudienceResponse,
  BasicsRequest,
  BasicsResponse,
  BrandRequest,
  BrandResponse,
  CompleteResponse,
  GoalsRequest,
  GoalsResponse,
  IdentityRequest,
  IdentityResponse,
  LogoUploadResponse,
  OnboardingState,
} from "@/features/onboarding/types";

const BASE_PATH = "/api/onboarding";

export function getOnboardingState(): Promise<OnboardingState> {
  return clientFetch<OnboardingState>(BASE_PATH);
}

export function updateBasics(payload: BasicsRequest): Promise<BasicsResponse> {
  return clientFetch<BasicsResponse>(`${BASE_PATH}/basics`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function uploadLogo(file: File): Promise<LogoUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return clientFetch<LogoUploadResponse>(`${BASE_PATH}/logo`, {
    method: "POST",
    body: formData,
  });
}

export function updateIdentity(payload: IdentityRequest): Promise<IdentityResponse> {
  return clientFetch<IdentityResponse>(`${BASE_PATH}/identity`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateAudience(payload: AudienceRequest): Promise<AudienceResponse> {
  return clientFetch<AudienceResponse>(`${BASE_PATH}/audience`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateBrand(payload: BrandRequest): Promise<BrandResponse> {
  return clientFetch<BrandResponse>(`${BASE_PATH}/brand`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateGoals(payload: GoalsRequest): Promise<GoalsResponse> {
  return clientFetch<GoalsResponse>(`${BASE_PATH}/goals`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function completeOnboarding(): Promise<CompleteResponse> {
  return clientFetch<CompleteResponse>(`${BASE_PATH}/complete`, {
    method: "POST",
  });
}
