import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/features/auth/api/login";

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
  });
}
