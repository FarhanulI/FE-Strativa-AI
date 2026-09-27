import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
