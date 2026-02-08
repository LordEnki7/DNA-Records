import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Shield,
  Users,
  Music2,
  TrendingUp,
  Megaphone,
  BarChart3,
} from "lucide-react";
import type { Artist, Track, Promotion, ARRecommendation } from "@shared/schema";

export default function Admin() {
  const { data: artists = [], isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: recommendations = [] } = useQuery<ARRecommendation[]>({
    queryKey: ["/api/admin/recommendations"],
  });

  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/admin/promotions"],
  });

  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);
  const totalListeners = artists.reduce(
    (sum, a) => sum + (a.monthlyListeners || 0),
    0
  );
  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const pendingPromos = promotions.filter((p) => p.status === "pending");

  const stats = [
    {
      label: "Total Artists",
      value: artists.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Total Tracks",
      value: tracks.length,
      icon: Music2,
      color: "text-chart-2",
    },
    {
      label: "Total Plays",
      value: totalPlays.toLocaleString(),
      icon: BarChart3,
      color: "text-chart-3",
    },
    {
      label: "Monthly Listeners",
      value: totalListeners.toLocaleString(),
      icon: TrendingUp,
      color: "text-chart-4",
    },
  ];

  return (
    <div className="p-6 pb-24 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Label Admin
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of EchoForge Records operations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/ar">
          <Card className="p-4 hover-elevate cursor-pointer" data-testid="card-admin-ar">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                A&R Recommendations
              </h3>
              {pendingRecs.length > 0 && (
                <Badge className="no-default-active-elevate">
                  {pendingRecs.length} pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered talent scouting recommendations awaiting human review
            </p>
          </Card>
        </Link>
        <Link href="/admin/marketing">
          <Card className="p-4 hover-elevate cursor-pointer" data-testid="card-admin-marketing">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                Marketing Campaigns
              </h3>
              {pendingPromos.length > 0 && (
                <Badge className="no-default-active-elevate">
                  {pendingPromos.length} pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              AI-generated promotional content awaiting approval
            </p>
          </Card>
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Roster Overview</h2>
        {artistsLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Card className="p-2">
            {artists.map((artist) => (
              <Link key={artist.id} href={`/artist/${artist.id}`}>
                <div
                  className="flex items-center gap-3 p-3 rounded-md hover-elevate cursor-pointer"
                  data-testid={`admin-artist-${artist.id}`}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                    {artist.avatarUrl ? (
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Users className="w-4 h-4 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{artist.name}</p>
                    <p className="text-xs text-muted-foreground">{artist.genre}</p>
                  </div>
                  <Badge
                    variant={artist.isSigned ? "default" : "secondary"}
                    className="no-default-active-elevate"
                  >
                    {artist.isSigned ? "Signed" : "Pending"}
                  </Badge>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{(artist.monthlyListeners || 0).toLocaleString()} listeners</p>
                    <p>{(artist.totalPlays || 0).toLocaleString()} plays</p>
                  </div>
                </div>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
