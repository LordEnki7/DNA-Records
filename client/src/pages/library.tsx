import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayer } from "@/components/music-player";
import { Link } from "wouter";
import { Heart, Music2, ListMusic, Play, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Artist, Track, Playlist } from "@shared/schema";

export default function Library() {
  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: artists = [], isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: playlists = [], isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const { playTrack } = usePlayer();

  const handlePlayTrack = (track: Track) => {
    const artist = artists.find((a) => a.id === track.artistId);
    playTrack(
      { ...track, artistName: artist?.name },
      tracks.map((t) => ({
        ...t,
        artistName: artists.find((a) => a.id === t.artistId)?.name,
      }))
    );
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your music collection
        </p>
      </div>

      <Tabs defaultValue="tracks">
        <TabsList>
          <TabsTrigger value="tracks" data-testid="tab-tracks">
            <Music2 className="w-4 h-4 mr-1" />
            All Tracks
          </TabsTrigger>
          <TabsTrigger value="playlists" data-testid="tab-playlists">
            <ListMusic className="w-4 h-4 mr-1" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="artists" data-testid="tab-artists">
            <Headphones className="w-4 h-4 mr-1" />
            Artists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="mt-4">
          {tracksLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <Card className="p-12 text-center">
              <Music2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No tracks available yet</p>
            </Card>
          ) : (
            <Card className="p-2">
              {tracks.map((track, i) => {
                const artist = artists.find((a) => a.id === track.artistId);
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer group"
                    onClick={() => handlePlayTrack(track)}
                    data-testid={`library-track-${track.id}`}
                  >
                    <span className="w-6 text-center text-xs text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <div className="w-9 h-9 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Music2 className="w-4 h-4 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {artist?.name || "Unknown"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {Math.floor((track.duration || 0) / 60)}:
                      {((track.duration || 0) % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="playlists" className="mt-4">
          {playlistsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <Card className="p-12 text-center">
              <ListMusic className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No playlists yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="p-4 hover-elevate cursor-pointer"
                  data-testid={`card-playlist-${playlist.id}`}
                >
                  <div className="w-full aspect-square rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                    <ListMusic className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="text-sm font-semibold truncate">
                    {playlist.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(playlist.trackIds || []).length} tracks
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="artists" className="mt-4">
          {artistsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artists.map((artist) => (
                <Link key={artist.id} href={`/artist/${artist.id}`}>
                  <Card
                    className="p-4 hover-elevate cursor-pointer group"
                    data-testid={`library-artist-${artist.id}`}
                  >
                    <div className="w-full aspect-square rounded-full overflow-hidden mb-3 bg-muted/30">
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
                    <h3 className="font-semibold text-sm text-center truncate">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center mt-0.5">
                      {artist.genre}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
