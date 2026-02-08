import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Cpu,
  BarChart3,
  Headphones,
} from "lucide-react";
import type { ARRecommendation, Artist } from "@shared/schema";

export default function AdminAR() {
  const { toast } = useToast();

  const { data: recommendations = [], isLoading } = useQuery<ARRecommendation[]>({
    queryKey: ["/api/admin/recommendations"],
  });

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/recommendations/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({ title: "Decision recorded", description: "The recommendation has been updated." });
    },
  });

  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const reviewedRecs = recommendations.filter((r) => r.status !== "pending");

  return (
    <div className="p-6 pb-24 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          A&R Scout
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered talent recommendations with human verification
        </p>
      </div>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-primary animate-neon-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium">AI A&R Bot Active</p>
          <p className="text-xs text-muted-foreground">
            Continuously scanning for high-potential AI artists
          </p>
        </div>
        <Badge className="ml-auto no-default-active-elevate">
          {pendingRecs.length} pending review
        </Badge>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-3">Pending Reviews</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-md" />
            ))}
          </div>
        ) : pendingRecs.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">
              All recommendations have been reviewed
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingRecs.map((rec) => {
              const artist = artists.find((a) => a.id === rec.artistId);
              return (
                <Card key={rec.id} className="p-4" data-testid={`ar-rec-${rec.id}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                      {artist?.avatarUrl ? (
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Headphones className="w-6 h-6 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link href={`/artist/${rec.artistId}`}>
                          <span className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer">
                            {artist?.name || "Unknown Artist"}
                          </span>
                        </Link>
                        <Badge variant="secondary" className="text-[10px] no-default-active-elevate">
                          {artist?.genre}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {rec.reason}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BarChart3 className="w-3 h-3" />
                          Score: {rec.score}/100
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Headphones className="w-3 h-3" />
                          {(artist?.monthlyListeners || 0).toLocaleString()} listeners
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          reviewMutation.mutate({ id: rec.id, status: "rejected" })
                        }
                        disabled={reviewMutation.isPending}
                        data-testid={`button-reject-${rec.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          reviewMutation.mutate({ id: rec.id, status: "approved" })
                        }
                        disabled={reviewMutation.isPending}
                        data-testid={`button-approve-${rec.id}`}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Sign
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {reviewedRecs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Review History</h2>
          <Card className="p-2">
            {reviewedRecs.map((rec) => {
              const artist = artists.find((a) => a.id === rec.artistId);
              return (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 p-2 rounded-md"
                >
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                    {artist?.avatarUrl ? (
                      <img
                        src={artist.avatarUrl}
                        alt={artist?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/5" />
                    )}
                  </div>
                  <span className="text-sm flex-1 truncate">
                    {artist?.name || "Unknown"}
                  </span>
                  <Badge
                    variant={rec.status === "approved" ? "default" : "secondary"}
                    className="no-default-active-elevate"
                  >
                    {rec.status === "approved" ? "Signed" : "Passed"}
                  </Badge>
                </div>
              );
            })}
          </Card>
        </section>
      )}
    </div>
  );
}
