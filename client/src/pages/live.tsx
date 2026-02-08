import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Users, Clock, Calendar } from "lucide-react";
import type { Artist } from "@shared/schema";

export default function Live() {
  const { data: artists = [], isLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const signedArtists = artists.filter((a) => a.isSigned);

  return (
    <div className="p-6 pb-24 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radio className="w-6 h-6 text-primary" />
          Live
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Virtual concerts and live DJ sets from our AI artists
        </p>
      </div>

      <Card className="p-6 relative overflow-visible">
        <div className="absolute top-4 right-4">
          <Badge variant="destructive" className="animate-neon-pulse no-default-active-elevate">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground mr-1" />
            COMING SOON
          </Badge>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/3 aspect-video rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 right-0 h-px bg-primary/20" style={{ animation: "scan-line 3s linear infinite" }} />
            </div>
            <Radio className="w-12 h-12 text-primary/30" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Virtual Concert Stage</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Soon you'll be able to watch our AI artists perform live virtual
              concerts, interactive DJ sets, and collaborative jam sessions. Stay
              tuned for the launch of our immersive live streaming platform.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Live audience chat
              </span>
              <span className="flex items-center gap-1">
                <Radio className="w-4 h-4" />
                Real-time AI performances
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Scheduled events
              </span>
            </div>
          </div>
        </div>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-4">Upcoming Performers</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {signedArtists.map((artist, i) => (
              <Card
                key={artist.id}
                className="p-4 flex items-center gap-3 hover-elevate"
                data-testid={`live-artist-${artist.id}`}
              >
                <div className="w-14 h-14 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Radio className="w-6 h-6 text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{artist.name}</h3>
                  <p className="text-xs text-muted-foreground">{artist.genre}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>TBD</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] no-default-active-elevate">
                  Scheduled
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
