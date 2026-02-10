import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function useUserLikes() {
  const { user } = useAuth();
  const { data: likedTrackIds = [] } = useQuery<string[]>({
    queryKey: ["/api/me/likes"],
    enabled: !!user,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const res = await apiRequest("POST", `/api/tracks/${trackId}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/likes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
    },
  });

  return {
    likedTrackIds,
    isLiked: (trackId: string) => likedTrackIds.includes(trackId),
    toggleLike: (trackId: string) => toggleLikeMutation.mutate(trackId),
    isPending: toggleLikeMutation.isPending,
  };
}

export function useUserFollows() {
  const { user } = useAuth();
  const { data: followedArtistIds = [] } = useQuery<string[]>({
    queryKey: ["/api/me/follows"],
    enabled: !!user,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async (artistId: string) => {
      const res = await apiRequest("POST", `/api/artists/${artistId}/follow`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/follows"] });
    },
  });

  return {
    followedArtistIds,
    isFollowing: (artistId: string) => followedArtistIds.includes(artistId),
    toggleFollow: (artistId: string) => toggleFollowMutation.mutate(artistId),
    isPending: toggleFollowMutation.isPending,
  };
}
