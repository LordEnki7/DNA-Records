import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldX, Loader2, Lock } from "lucide-react";
import type { User } from "@shared/models/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const claimAdminMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/claim-admin", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const typedUser = user as User | null;

  if (!typedUser?.isAdmin) {
    const isFirstAdmin = claimAdminMutation.isError &&
      (claimAdminMutation.error as any)?.message?.includes("already exists");

    return (
      <div className="flex items-center justify-center min-h-64 p-8">
        <Card className="max-w-md w-full border-border/50 bg-card/50">
          <CardHeader className="text-center pb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              {claimAdminMutation.isError ? (
                <ShieldX className="w-6 h-6 text-red-400" />
              ) : (
                <Lock className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-lg">
              {claimAdminMutation.isError ? "Access Denied" : "Admin Access Required"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {claimAdminMutation.isError ? (
              <>
                <p className="text-sm text-muted-foreground">
                  An admin already exists. Contact your system administrator to grant you access.
                </p>
                <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded p-2">
                  Logged in as: {typedUser?.email ?? typedUser?.firstName ?? "Unknown"}
                </p>
              </>
            ) : claimAdminMutation.isSuccess ? (
              <p className="text-sm text-green-400">
                Admin access granted! Reloading...
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You need admin privileges to access this section.
                </p>
                <p className="text-xs text-muted-foreground">
                  If you are the platform owner, click below to claim the admin role.
                  This only works if no other admin exists yet.
                </p>
                <Button
                  onClick={() => claimAdminMutation.mutate()}
                  disabled={claimAdminMutation.isPending}
                  className="w-full"
                  data-testid="button-claim-admin"
                >
                  {claimAdminMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4 mr-2" /> Claim Admin Access</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Logged in as: <span className="font-mono">{typedUser?.email ?? typedUser?.firstName ?? "Unknown"}</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
