import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdentity } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIdentity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
