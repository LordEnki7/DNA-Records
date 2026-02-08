import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayer } from "@/components/music-player";
import { Link } from "wouter";
import { useState } from "react";
import {
  Search,
  Play,
  Headphones,
  TrendingUp,
  Music2,
  Filter,
} from "lucide-react";
import type { Artist, Track } from "@shared/schema";

const genres = [
  "All",
  "Electronic",
  "Ambient",
  "Hip-Hop",
  "Pop",
  "Synthwave",
  "Lo-Fi",
  "Classical",
  "Experimental",
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const { data: artists = [], isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { playTrack } = usePlayer();

  const filteredArtists = artists.filter((a) => {
    const matchesSearch =
      searchQuery === "" ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || a.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || t.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handlePlayTrack = (track: Track) => {
    const artist = artists.find((a) => a.id === track.artistId);
    const queue = filteredTracks.map((t) => ({
      ...t,
      artistName: artists.find((a) => a.id === t.artistId)?.name,
    }));
    playTrack({ ...track, artistName: artist?.name }, queue);
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore AI artists and their music
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search artists, tracks, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Badge
            key={genre}
            variant={selectedGenre === genre ? "default" : "secondary"}
            className={`cursor-pointer toggle-elevate ${selectedGenre === genre ? "toggle-elevated" : ""}`}
            onClick={() => setSelectedGenre(genre)}
            data-testid={`badge-genre-${genre.toLowerCase()}`}
          >
            {genre}
          </Badge>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-primary" />
          Artists
          <span className="text-sm font-normal text-muted-foreground">
            ({filteredArtists.length})
          </span>
        </h2>
        {artistsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredArtists.map((artist) => (
              <Link key={artist.id} href={`/artist/${artist.id}`}>
                <Card
                  className="overflow-visible hover-elevate cursor-pointer group"
                  data-testid={`card-discover-artist-${artist.id}`}
                >
                  <div className="aspect-square overflow-hidden rounded-t-md bg-muted/30">
                    {artist.avatarUrl ? (
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Music2 className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{artist.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] no-default-active-elevate">
                        {artist.genre}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      {(artist.monthlyListeners || 0).toLocaleString()} listeners
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Music2 className="w-5 h-5 text-primary" />
          Tracks
          <span className="text-sm font-normal text-muted-foreground">
            ({filteredTracks.length})
          </span>
        </h2>
        {tracksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTracks.map((track) => {
              const artist = artists.find((a) => a.id === track.artistId);
              return (
                <Card
                  key={track.id}
                  className="p-3 flex items-center gap-3 hover-elevate cursor-pointer group"
                  onClick={() => handlePlayTrack(track)}
                  data-testid={`card-discover-track-${track.id}`}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Music2 className="w-5 h-5 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {artist?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {Math.floor((track.duration || 0) / 60)}:
                    {((track.duration || 0) % 60).toString().padStart(2, "0")}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
