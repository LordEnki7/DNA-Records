import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

async function fetchAdminStatus(): Promise<{ isAdmin: boolean }> {
  const res = await fetch("/api/auth/admin-status", { credentials: "include" });
  if (!res.ok) return { isAdmin: false };
  return res.json();
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/admin-status"],
    queryFn: fetchAdminStatus,
    staleTime: 30 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.isAdmin) {
    setLocation("/admin/login");
    return null;
  }

  return <>{children}</>;
}
