import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayer } from "@/components/music-player";
import { useUserLikes, useUserFollows } from "@/hooks/use-interactions";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { useState, useCallback } from "react";
import {
  Heart,
  Music2,
  ListMusic,
  Play,
  Headphones,
  Plus,
  UserCheck,
  GripVertical,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Artist, Track, Playlist } from "@shared/schema";

function SortableTrackItem({
  track,
  artist,
  index,
  onPlay,
}: {
  track: Track;
  artist?: Artist;
  index: number;
  onPlay: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer group"
      data-testid={`sortable-track-${track.id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground touch-none"
        data-testid={`drag-handle-${track.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="w-6 text-center text-xs text-muted-foreground tabular-nums">
        {index + 1}
      </span>
      <div
        className="flex items-center gap-3 flex-1 min-w-0"
        onClick={onPlay}
      >
        <div className="w-9 h-9 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
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
          <p className="text-xs text-muted-foreground truncate">{artist?.name || "Unknown"}</p>
        </div>
      </div>
      <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
        {Math.floor((track.duration || 0) / 60)}:
        {((track.duration || 0) % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );
}

export default function Library() {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: artists = [], isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: playlists = [], isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const selectedPlaylist = selectedPlaylistId
    ? playlists.find((p) => p.id === selectedPlaylistId) || null
    : null;

  const { playTrack } = usePlayer();
  const { isLiked, toggleLike, likedTrackIds } = useUserLikes();
  const { followedArtistIds } = useUserFollows();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reorderMutation = useMutation({
    mutationFn: async ({ playlistId, trackIds }: { playlistId: string; trackIds: string[] }) => {
      const res = await apiRequest("PATCH", `/api/playlists/${playlistId}/reorder`, { trackIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
    },
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !selectedPlaylist) return;
      const currentTrackIds = selectedPlaylist.trackIds || [];
      const oldIndex = currentTrackIds.indexOf(active.id as string);
      const newIndex = currentTrackIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(currentTrackIds, oldIndex, newIndex);
      reorderMutation.mutate({ playlistId: selectedPlaylist.id, trackIds: newOrder });
    },
    [selectedPlaylist, reorderMutation]
  );

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/playlists", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setNewPlaylistName("");
      setDialogOpen(false);
    },
  });

  const handlePlayTrack = (track: Track, trackList: Track[]) => {
    const artist = artists.find((a) => a.id === track.artistId);
    playTrack(
      { ...track, artistName: artist?.name },
      trackList.map((t) => ({
        ...t,
        artistName: artists.find((a) => a.id === t.artistId)?.name,
      }))
    );
  };

  const likedTracks = tracks.filter((t) => likedTrackIds.includes(t.id));
  const followedArtists = artists.filter((a) => followedArtistIds.includes(a.id));

  return (
    <div className="p-4 sm:p-6 pb-24 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your music collection
        </p>
      </div>

      <Tabs defaultValue="liked">
        <TabsList className="flex-wrap">
          <TabsTrigger value="liked" data-testid="tab-liked">
            <Heart className="w-4 h-4 mr-1" />
            Liked
          </TabsTrigger>
          <TabsTrigger value="tracks" data-testid="tab-tracks">
            <Music2 className="w-4 h-4 mr-1" />
            All Tracks
          </TabsTrigger>
          <TabsTrigger value="playlists" data-testid="tab-playlists">
            <ListMusic className="w-4 h-4 mr-1" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="following" data-testid="tab-following">
            <UserCheck className="w-4 h-4 mr-1" />
            Following
          </TabsTrigger>
          <TabsTrigger value="artists" data-testid="tab-artists">
            <Headphones className="w-4 h-4 mr-1" />
            All Artists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liked" className="mt-4">
          {likedTracks.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No liked tracks yet</p>
              <p className="text-xs text-muted-foreground mt-1">Tap the heart on any track to save it here</p>
            </Card>
          ) : (
            <Card className="p-2">
              {likedTracks.map((track, i) => {
                const artist = artists.find((a) => a.id === track.artistId);
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer group"
                    onClick={() => handlePlayTrack(track, likedTracks)}
                    data-testid={`liked-track-${track.id}`}
                  >
                    <span className="w-6 text-center text-xs text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <div className="w-9 h-9 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
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
                      <p className="text-xs text-muted-foreground truncate">{artist?.name || "Unknown"}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500"
                      onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                      data-testid={`button-unlike-${track.id}`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                      {Math.floor((track.duration || 0) / 60)}:
                      {((track.duration || 0) % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
        </TabsContent>

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
                const liked = isLiked(track.id);
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer group"
                    onClick={() => handlePlayTrack(track, tracks)}
                    data-testid={`library-track-${track.id}`}
                  >
                    <span className="w-6 text-center text-xs text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <div className="w-9 h-9 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
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
                      <p className="text-xs text-muted-foreground truncate">{artist?.name || "Unknown"}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={liked ? "text-red-500" : "text-muted-foreground"}
                      onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                    >
                      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
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
          {selectedPlaylist ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedPlaylistId(null)}
                  data-testid="button-back-playlists"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h3 className="text-lg font-bold" data-testid="text-playlist-name">
                    {selectedPlaylist.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {(selectedPlaylist.trackIds || []).length} tracks &middot; Drag to reorder
                  </p>
                </div>
              </div>
              {(selectedPlaylist.trackIds || []).length === 0 ? (
                <Card className="p-12 text-center">
                  <Music2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground">No tracks in this playlist</p>
                </Card>
              ) : (
                <Card className="p-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedPlaylist.trackIds || []}
                      strategy={verticalListSortingStrategy}
                    >
                      {(selectedPlaylist.trackIds || []).map((trackId, i) => {
                        const track = tracks.find((t) => t.id === trackId);
                        if (!track) return null;
                        const artist = artists.find((a) => a.id === track.artistId);
                        return (
                          <SortableTrackItem
                            key={track.id}
                            track={track}
                            artist={artist}
                            index={i}
                            onPlay={() => {
                              const playlistTracks = (selectedPlaylist.trackIds || [])
                                .map((id) => tracks.find((t) => t.id === id))
                                .filter(Boolean) as Track[];
                              handlePlayTrack(track, playlistTracks);
                            }}
                          />
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                </Card>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {playlists.length} playlists
                </h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-create-playlist">
                      <Plus className="w-4 h-4 mr-1" />
                      New Playlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Playlist</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newPlaylistName.trim()) {
                          createPlaylistMutation.mutate(newPlaylistName.trim());
                        }
                      }}
                      className="space-y-4"
                    >
                      <Input
                        placeholder="Playlist name"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        data-testid="input-playlist-name"
                      />
                      <Button
                        type="submit"
                        disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
                        data-testid="button-save-playlist"
                      >
                        {createPlaylistMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
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
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                      data-testid={`card-playlist-${playlist.id}`}
                    >
                      <div className="w-full aspect-square rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                        <ListMusic className="w-10 h-10 text-primary/40" />
                      </div>
                      <h3 className="text-sm font-semibold truncate">{playlist.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(playlist.trackIds || []).length} tracks
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          {followedArtists.length === 0 ? (
            <Card className="p-12 text-center">
              <UserCheck className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">Not following any artists yet</p>
              <p className="text-xs text-muted-foreground mt-1">Follow artists to see them here</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {followedArtists.map((artist) => (
                <Link key={artist.id} href={`/artist/${artist.id}`}>
                  <Card className="p-4 hover-elevate cursor-pointer group" data-testid={`following-artist-${artist.id}`}>
                    <div className="w-full aspect-square rounded-full overflow-hidden mb-3 bg-muted/30">
                      {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Headphones className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-center truncate">{artist.name}</h3>
                    <p className="text-xs text-muted-foreground text-center mt-0.5">{artist.genre}</p>
                  </Card>
                </Link>
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
                  <Card className="p-4 hover-elevate cursor-pointer group" data-testid={`library-artist-${artist.id}`}>
                    <div className="w-full aspect-square rounded-full overflow-hidden mb-3 bg-muted/30">
                      {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Headphones className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-center truncate">{artist.name}</h3>
                    <p className="text-xs text-muted-foreground text-center mt-0.5">{artist.genre}</p>
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
