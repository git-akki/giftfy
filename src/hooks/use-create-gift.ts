import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function useCreateGift() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (options?: { occasion?: string; tier?: string }) => {
    const params = new URLSearchParams();
    if (options?.occasion) params.set("occasion", options.occasion);
    if (options?.tier) params.set("tier", options.tier);
    const target = `/builder${params.toString() ? `?${params}` : ""}`;

    if (user) {
      navigate(target);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
    }
  };
}
