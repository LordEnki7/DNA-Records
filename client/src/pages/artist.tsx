import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayer } from "@/components/music-player";
import { useUserLikes, useUserFollows } from "@/hooks/use-interactions";
import {
  Play,
  Headphones,
  TrendingUp,
  Music2,
  Clock,
  CheckCircle2,
  Heart,
  UserPlus,
  UserCheck,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Artist, Track, ArtistDailyStat } from "@shared/schema";

export default function ArtistProfile() {
  const [, params] = useRoute("/artist/:id");
  const artistId = params?.id;

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ["/api/artists", artistId],
    enabled: !!artistId,
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/artists", artistId, "tracks"],
    enabled: !!artistId,
  });

  const { data: stats = [] } = useQuery<ArtistDailyStat[]>({
    queryKey: ["/api/artists", artistId, "stats"],
    enabled: !!artistId,
  });

  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { isLiked, toggleLike } = useUserLikes();
  const { isFollowing, toggleFollow } = useUserFollows();

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      const queue = tracks.map((t) => ({ ...t, artistName: artist?.name }));
      playTrack(queue[0], queue);
    }
  };

  const handlePlayTrack = (track: Track) => {
    const queue = tracks.map((t) => ({ ...t, artistName: artist?.name }));
    playTrack({ ...track, artistName: artist?.name }, queue);
  };

  if (artistLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Artist not found</p>
      </div>
    );
  }

  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  const chartData = stats.map((s) => ({
    date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    plays: s.plays || 0,
    followers: s.followers || 0,
    popularity: s.popularity || 0,
  }));

  return (
    <div className="pb-24">
      <div className="relative h-64 md:h-80 overflow-hidden">
        {artist.coverUrl || artist.avatarUrl ? (
          <img
            src={artist.coverUrl || artist.avatarUrl || ""}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-4 max-w-4xl mx-auto">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-primary/30 shadow-lg">
              {artist.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-10 h-10 text-primary/40" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {artist.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
                <Badge variant="secondary" className="text-[10px] no-default-active-elevate">
                  {artist.isSigned ? "Signed" : "Independent"}
                </Badge>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold truncate"
                data-testid="text-artist-name"
              >
                {artist.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Headphones className="w-4 h-4" />
                  {(artist.monthlyListeners || 0).toLocaleString()} monthly listeners
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {totalPlays.toLocaleString()} total plays
                </span>
                <Badge variant="secondary" className="no-default-active-elevate">{artist.genre}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={handlePlayAll} data-testid="button-play-all">
            <Play className="w-4 h-4 mr-1" />
            Play All
          </Button>
          <Button
            variant={isFollowing(artist.id) ? "secondary" : "outline"}
            onClick={() => toggleFollow(artist.id)}
            data-testid="button-follow-artist"
          >
            {isFollowing(artist.id) ? (
              <UserCheck className="w-4 h-4 mr-1" />
            ) : (
              <UserPlus className="w-4 h-4 mr-1" />
            )}
            {isFollowing(artist.id) ? "Following" : "Follow"}
          </Button>
        </div>

        {artist.bio && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {artist.bio}
            </p>
          </Card>
        )}

        {chartData.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Analytics
              <span className="text-sm font-normal text-muted-foreground">(Last 30 days)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Daily Plays</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="playsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="plays" stroke="hsl(25, 95%, 53%)" fill="url(#playsGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Popularity Score</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="popularity" stroke="hsl(var(--primary))" fill="url(#popGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            Discography
            <span className="text-sm font-normal text-muted-foreground">
              ({tracks.length} tracks)
            </span>
          </h2>

          {tracksLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <Card className="p-8 text-center">
              <Music2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No tracks released yet</p>
            </Card>
          ) : (
            <Card className="p-2">
              {tracks.map((track, i) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const liked = isLiked(track.id);
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer group"
                    onClick={() => handlePlayTrack(track)}
                    data-testid={`artist-track-${track.id}`}
                  >
                    <span className="w-6 text-center text-xs text-muted-foreground tabular-nums group-hover:invisible">
                      {i + 1}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="invisible group-hover:visible absolute ml-0"
                      onClick={(e) => { e.stopPropagation(); handlePlayTrack(track); }}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <div className="w-9 h-9 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className={`w-3 h-3 rounded-full border border-primary ${isCurrentTrack && isPlaying ? "animate-neon-pulse" : ""}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCurrentTrack ? "text-primary" : ""}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{track.genre}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={liked ? "text-red-500" : "text-muted-foreground"}
                      onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                      data-testid={`button-like-track-${track.id}`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                    </Button>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {(track.plays || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {Math.floor((track.duration || 0) / 60)}:
                        {((track.duration || 0) % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
