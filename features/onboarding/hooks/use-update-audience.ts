import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAudience } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateAudience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAudience,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
