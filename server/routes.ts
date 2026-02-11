import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

function getUser(req: any): { id: string } | null {
  if (req.user && req.user.id) return req.user;
  return null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/artists", async (_req, res) => {
    try {
      const artistList = await storage.getArtists();
      res.json(artistList);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
    try {
      const artist = await storage.getArtist(req.params.id);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.get("/api/artists/:id/tracks", async (req, res) => {
    try {
      const trackList = await storage.getTracksByArtist(req.params.id);
      res.json(trackList);
    } catch (error) {
      console.error("Error fetching artist tracks:", error);
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.get("/api/artists/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getArtistStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching artist stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/tracks", async (_req, res) => {
    try {
      const trackList = await storage.getTracks();
      res.json(trackList);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.post("/api/tracks/:id/play", async (req, res) => {
    try {
      await storage.incrementPlays(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing plays:", error);
      res.status(500).json({ message: "Failed to increment plays" });
    }
  });

  app.post("/api/tracks/:id/like", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const liked = await storage.toggleLike(user.id, req.params.id);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post("/api/artists/:id/follow", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const following = await storage.toggleFollow(user.id, req.params.id);
      res.json({ following });
    } catch (error) {
      console.error("Error toggling follow:", error);
      res.status(500).json({ message: "Failed to toggle follow" });
    }
  });

  app.get("/api/me/likes", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const likedIds = await storage.getUserLikes(user.id);
      res.json(likedIds);
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.get("/api/me/follows", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const followedIds = await storage.getUserFollows(user.id);
      res.json(followedIds);
    } catch (error) {
      console.error("Error fetching follows:", error);
      res.status(500).json({ message: "Failed to fetch follows" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      if (!query.trim()) {
        return res.json({ artists: [], tracks: [] });
      }
      const results = await storage.searchArtistsAndTracks(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  app.get("/api/playlists", async (req, res) => {
    try {
      const user = getUser(req);
      if (user) {
        const playlistList = await storage.getPlaylistsByUser(user.id);
        res.json(playlistList);
      } else {
        const playlistList = await storage.getPlaylists();
        res.json(playlistList);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const playlist = await storage.createPlaylist({
        name,
        description: description || null,
        userId: user.id,
        isAutoGenerated: false,
        trackIds: [],
      });
      res.json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).json({ message: "Failed to create playlist" });
    }
  });

  app.patch("/api/playlists/:id", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const playlist = await storage.updatePlaylist(req.params.id, req.body);
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });
      res.json(playlist);
    } catch (error) {
      console.error("Error updating playlist:", error);
      res.status(500).json({ message: "Failed to update playlist" });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      await storage.deletePlaylist(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ message: "Failed to delete playlist" });
    }
  });

  app.get("/api/live-sessions", async (_req, res) => {
    try {
      const sessions = await storage.getLiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ message: "Failed to fetch live sessions" });
    }
  });

  app.get("/api/notifications", async (_req, res) => {
    try {
      const notifList = await storage.getNotifications();
      res.json(notifList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/read-all", async (_req, res) => {
    try {
      await storage.markAllNotificationsRead();
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notifications:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  app.get("/api/admin/recommendations", async (_req, res) => {
    try {
      const recs = await storage.getRecommendations();
      res.json(recs);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.patch("/api/admin/recommendations/:id", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const rec = await storage.updateRecommendation(req.params.id, status);
      if (!rec) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      res.json(rec);
    } catch (error) {
      console.error("Error updating recommendation:", error);
      res.status(500).json({ message: "Failed to update recommendation" });
    }
  });

  app.get("/api/admin/promotions", async (_req, res) => {
    try {
      const promoList = await storage.getPromotions();
      res.json(promoList);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.patch("/api/admin/promotions/:id", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const promo = await storage.updatePromotion(req.params.id, status);
      if (!promo) {
        return res.status(404).json({ message: "Promotion not found" });
      }
      res.json(promo);
    } catch (error) {
      console.error("Error updating promotion:", error);
      res.status(500).json({ message: "Failed to update promotion" });
    }
  });

  app.get("/api/admin/revenue", async (req, res) => {
    try {
      const artistId = req.query.artistId as string | undefined;
      if (artistId) {
        const data = await storage.getRevenueByArtist(artistId);
        res.json(data);
      } else {
        const data = await storage.getRevenueByArtist();
        res.json(data);
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
      res.status(500).json({ message: "Failed to fetch revenue" });
    }
  });

  app.get("/api/admin/revenue/summary", async (_req, res) => {
    try {
      const summary = await storage.getRevenueSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching revenue summary:", error);
      res.status(500).json({ message: "Failed to fetch revenue summary" });
    }
  });

  app.get("/api/admin/calendar", async (_req, res) => {
    try {
      const items = await storage.getCalendarItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching calendar:", error);
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  app.patch("/api/admin/calendar/:id", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["approved", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const item = await storage.updateCalendarItem(req.params.id, status);
      if (!item) {
        return res.status(404).json({ message: "Calendar item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating calendar item:", error);
      res.status(500).json({ message: "Failed to update calendar item" });
    }
  });

  app.patch("/api/playlists/:id/reorder", async (req, res) => {
    try {
      const user = getUser(req);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const { trackIds } = req.body;
      if (!Array.isArray(trackIds)) {
        return res.status(400).json({ message: "trackIds must be an array" });
      }
      const playlist = await storage.reorderPlaylist(req.params.id, trackIds);
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });
      res.json(playlist);
    } catch (error) {
      console.error("Error reordering playlist:", error);
      res.status(500).json({ message: "Failed to reorder playlist" });
    }
  });

  return httpServer;
}
