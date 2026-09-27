import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadLogo } from "@/features/onboarding/api/onboarding";
import { ONBOARDING_STATE_QUERY_KEY } from "@/features/onboarding/hooks/query-keys";

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ONBOARDING_STATE_QUERY_KEY });
    },
  });
}
