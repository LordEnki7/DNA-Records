import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  Cpu,
  Music2,
  Headphones,
} from "lucide-react";
import type { Promotion, Artist, Track } from "@shared/schema";

const platformColors: Record<string, string> = {
  twitter: "bg-chart-2/10 text-chart-2",
  instagram: "bg-chart-3/10 text-chart-3",
  tiktok: "bg-chart-1/10 text-chart-1",
  blog: "bg-chart-4/10 text-chart-4",
};

export default function AdminMarketing() {
  const { toast } = useToast();

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/admin/promotions"],
  });

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/promotions/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      toast({ title: "Campaign updated", description: "The promotion status has been updated." });
    },
  });

  const pendingPromos = promotions.filter((p) => p.status === "pending");
  const reviewedPromos = promotions.filter((p) => p.status !== "pending");

  return (
    <div className="p-6 pb-24 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" />
          Marketing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated promotional campaigns with human approval
        </p>
      </div>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-primary animate-neon-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium">AI Marketing Bot Active</p>
          <p className="text-xs text-muted-foreground">
            Generating targeted campaigns for new releases
          </p>
        </div>
        <Badge className="ml-auto no-default-active-elevate">
          {pendingPromos.length} pending approval
        </Badge>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-3">Pending Approval</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-md" />
            ))}
          </div>
        ) : pendingPromos.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">
              All campaigns have been reviewed
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingPromos.map((promo) => {
              const artist = artists.find((a) => a.id === promo.artistId);
              const track = tracks.find((t) => t.id === promo.trackId);
              const platformClass =
                platformColors[promo.platform] || "bg-muted text-muted-foreground";

              return (
                <Card key={promo.id} className="p-4" data-testid={`promo-${promo.id}`}>
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${platformClass} no-default-active-elevate`}>
                        {promo.platform}
                      </Badge>
                      {artist && (
                        <span className="text-sm font-medium">{artist.name}</span>
                      )}
                      {track && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Music2 className="w-3 h-3" />
                          {track.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-3 mb-3">
                    <p className="text-sm font-medium mb-1">{promo.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {promo.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        reviewMutation.mutate({ id: promo.id, status: "rejected" })
                      }
                      disabled={reviewMutation.isPending}
                      data-testid={`button-reject-promo-${promo.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        reviewMutation.mutate({ id: promo.id, status: "approved" })
                      }
                      disabled={reviewMutation.isPending}
                      data-testid={`button-approve-promo-${promo.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {reviewedPromos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Campaign History</h2>
          <Card className="p-2">
            {reviewedPromos.map((promo) => {
              const artist = artists.find((a) => a.id === promo.artistId);
              return (
                <div
                  key={promo.id}
                  className="flex items-center gap-3 p-2 rounded-md"
                >
                  <Badge
                    className={`${platformColors[promo.platform] || "bg-muted"} text-[10px] no-default-active-elevate`}
                  >
                    {promo.platform}
                  </Badge>
                  <span className="text-sm flex-1 truncate">{promo.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {artist?.name}
                  </span>
                  <Badge
                    variant={promo.status === "approved" ? "default" : "secondary"}
                    className="no-default-active-elevate"
                  >
                    {promo.status}
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
