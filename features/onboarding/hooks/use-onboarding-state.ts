import { useQuery } from "@tanstack/react-query";
import { getOnboardingState } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useOnboardingState() {
  return useQuery({
    queryKey: ONBOARDING_STATE_QUERY_KEY,
    queryFn: getOnboardingState,
  });
}
