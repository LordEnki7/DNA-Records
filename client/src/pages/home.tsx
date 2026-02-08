import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { usePlayer } from "@/components/music-player";
import { Link } from "wouter";
import { Play, TrendingUp, Clock, Headphones } from "lucide-react";
import type { Artist, Track } from "@shared/schema";

function TrackRow({
  track,
  artist,
  index,
  allTracks,
  allArtists,
}: {
  track: Track;
  artist?: Artist;
  index: number;
  allTracks: Track[];
  allArtists: Artist[];
}) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = () => {
    const queue = allTracks.map((t) => ({
      ...t,
      artistName: allArtists.find((a) => a.id === t.artistId)?.name,
    }));
    playTrack(
      { ...track, artistName: artist?.name },
      queue
    );
  };

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-md hover-elevate group cursor-pointer"
      onClick={handlePlay}
      data-testid={`track-row-${track.id}`}
    >
      <span className="w-6 text-center text-xs text-muted-foreground tabular-nums group-hover:invisible">
        {index + 1}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="w-6 h-6 invisible group-hover:visible absolute ml-0"
        data-testid={`button-play-track-${track.id}`}
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
        {artist && (
          <Link href={`/artist/${artist.id}`}>
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {artist.name}
            </span>
          </Link>
        )}
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {Math.floor((track.duration || 0) / 60)}:
        {((track.duration || 0) % 60).toString().padStart(2, "0")}
      </span>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Headphones className="w-3 h-3" />
        <span className="tabular-nums">{(track.plays || 0).toLocaleString()}</span>
      </div>
    </div>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artist/${artist.id}`}>
      <Card className="p-4 hover-elevate cursor-pointer group" data-testid={`card-artist-${artist.id}`}>
        <div className="w-full aspect-square rounded-md overflow-hidden mb-3 bg-muted/30">
          {artist.avatarUrl ? (
            <img
              src={artist.avatarUrl}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Headphones className="w-8 h-8 text-primary/40" />
            </div>
          )}
        </div>
        <h3 className="font-semibold text-sm truncate">{artist.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{artist.genre}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>{(artist.monthlyListeners || 0).toLocaleString()} listeners</span>
        </div>
      </Card>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();

  const { data: artists = [], isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const trendingTracks = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 8);
  const newReleases = [...tracks].sort((a, b) =>
    new Date(b.releaseDate || b.createdAt || 0).getTime() -
    new Date(a.releaseDate || a.createdAt || 0).getTime()
  ).slice(0, 5);
  const topArtists = [...artists].sort((a, b) => (b.monthlyListeners || 0) - (a.monthlyListeners || 0)).slice(0, 6);

  return (
    <div className="p-6 pb-24 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-welcome">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover the latest from our AI artist roster
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Now
          </h2>
          <Link href="/discover">
            <Button variant="ghost" size="sm" data-testid="button-see-all-trending">
              See all
            </Button>
          </Link>
        </div>
        {tracksLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Card className="p-2">
            {trendingTracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                artist={artists.find((a) => a.id === track.artistId)}
                index={i}
                allTracks={trendingTracks}
                allArtists={artists}
              />
            ))}
          </Card>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            Top Artists
          </h2>
          <Link href="/discover">
            <Button variant="ghost" size="sm" data-testid="button-see-all-artists">
              See all
            </Button>
          </Link>
        </div>
        {artistsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            New Releases
          </h2>
        </div>
        {tracksLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Card className="p-2">
            {newReleases.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                artist={artists.find((a) => a.id === track.artistId)}
                index={i}
                allTracks={newReleases}
                allArtists={artists}
              />
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
