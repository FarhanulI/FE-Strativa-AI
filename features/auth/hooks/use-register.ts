import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/features/auth/api/register";

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}
