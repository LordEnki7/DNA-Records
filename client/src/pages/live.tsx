import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Users, Clock, Calendar, Headphones } from "lucide-react";
import { Link } from "wouter";
import type { Artist, LiveSession } from "@shared/schema";

function formatSessionTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTimeUntil(date: Date | string) {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `In ${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `In ${hours}h ${minutes}m`;
  return `In ${minutes}m`;
}

function SessionCard({ session, artist }: { session: LiveSession; artist?: Artist }) {
  const isLive = session.status === "live";
  const isUpcoming = session.status === "upcoming";

  return (
    <Card
      className={`p-4 hover-elevate ${isLive ? "ring-1 ring-red-500/30" : ""}`}
      data-testid={`live-session-${session.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
          {artist?.avatarUrl ? (
            <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Radio className="w-6 h-6 text-primary/30" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isLive && (
              <Badge variant="destructive" className="text-[10px] animate-neon-pulse no-default-active-elevate">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground mr-1" />
                LIVE
              </Badge>
            )}
            {isUpcoming && (
              <Badge variant="secondary" className="text-[10px] no-default-active-elevate">
                UPCOMING
              </Badge>
            )}
            {session.status === "ended" && (
              <Badge variant="outline" className="text-[10px] no-default-active-elevate">
                ENDED
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm truncate" data-testid={`text-session-title-${session.id}`}>
            {session.title}
          </h3>
          {artist && (
            <Link href={`/artist/${artist.id}`}>
              <p className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {artist.name}
              </p>
            </Link>
          )}
          {session.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{session.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatSessionTime(session.startsAt)}
            </span>
            {isLive && (session.viewerCount ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <Users className="w-3 h-3" />
                {(session.viewerCount ?? 0).toLocaleString()} watching
              </span>
            )}
            {session.status === "ended" && (session.viewerCount ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {(session.viewerCount ?? 0).toLocaleString()} watched
              </span>
            )}
            {isUpcoming && (
              <span className="flex items-center gap-1 text-primary">
                <Calendar className="w-3 h-3" />
                {getTimeUntil(session.startsAt)}
              </span>
            )}
          </div>
        </div>
      </div>
      {isLive && (
        <Button className="w-full mt-3" size="sm" data-testid={`button-watch-${session.id}`}>
          <Radio className="w-3.5 h-3.5 mr-1" />
          Watch Now
        </Button>
      )}
      {isUpcoming && (
        <Button variant="outline" className="w-full mt-3" size="sm" data-testid={`button-remind-${session.id}`}>
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Set Reminder
        </Button>
      )}
    </Card>
  );
}

export default function Live() {
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions"],
  });

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const artistMap = new Map(artists.map((a) => [a.id, a]));
  const liveSessions = sessions.filter((s) => s.status === "live");
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const pastSessions = sessions.filter((s) => s.status === "ended");

  return (
    <div className="p-4 sm:p-6 pb-24 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radio className="w-6 h-6 text-primary" />
          Live
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Virtual concerts and live sessions from our AI artists
        </p>
      </div>

      {sessionsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-md" />
          ))}
        </div>
      ) : (
        <>
          {liveSessions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-neon-pulse" />
                Live Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {liveSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    artist={artistMap.get(session.artistId)}
                  />
                ))}
              </div>
            </section>
          )}

          {upcomingSessions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    artist={artistMap.get(session.artistId)}
                  />
                ))}
              </div>
            </section>
          )}

          {pastSessions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Past Sessions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    artist={artistMap.get(session.artistId)}
                  />
                ))}
              </div>
            </section>
          )}

          {sessions.length === 0 && (
            <Card className="p-12 text-center">
              <Radio className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No live sessions scheduled</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
