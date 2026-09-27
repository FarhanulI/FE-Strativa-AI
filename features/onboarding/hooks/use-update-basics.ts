import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBasics } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUpdateBasics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBasics,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
