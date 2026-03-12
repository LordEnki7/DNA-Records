import {
  artists,
  tracks,
  playlists,
  userLikes,
  userFollows,
  liveSessions,
  artistDailyStats,
  notifications,
  arRecommendations,
  promotions,
  revenueDaily,
  contentCalendar,
  agents,
  agentTasks,
  executionRuns,
  agentMemory,
  type Artist,
  type InsertArtist,
  type Track,
  type InsertTrack,
  type Playlist,
  type InsertPlaylist,
  type Notification,
  type InsertNotification,
  type ARRecommendation,
  type Promotion,
  type InsertPromotion,
  type LiveSession,
  type ArtistDailyStat,
  type RevenueDaily,
  type ContentCalendarItem,
  type InsertContentCalendarItem,
  type Agent,
  type InsertAgent,
  type AgentTask,
  type InsertAgentTask,
  type ExecutionRun,
  type InsertExecutionRun,
  type AgentMemory,
  type InsertAgentMemory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, or, ilike, asc } from "drizzle-orm";

export interface IStorage {
  getArtists(): Promise<Artist[]>;
  getArtist(id: string): Promise<Artist | undefined>;
  createArtist(data: InsertArtist): Promise<Artist>;
  updateArtist(id: string, data: Partial<InsertArtist>): Promise<Artist | undefined>;

  getTracks(): Promise<Track[]>;
  getTrack(id: string): Promise<Track | undefined>;
  getTracksByArtist(artistId: string): Promise<Track[]>;
  createTrack(data: InsertTrack): Promise<Track>;
  incrementPlays(trackId: string): Promise<void>;

  getPlaylists(): Promise<Playlist[]>;
  getPlaylistsByUser(userId: string): Promise<Playlist[]>;
  createPlaylist(data: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, data: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<void>;

  getUserLikes(userId: string): Promise<string[]>;
  toggleLike(userId: string, trackId: string): Promise<boolean>;

  getUserFollows(userId: string): Promise<string[]>;
  toggleFollow(userId: string, artistId: string): Promise<boolean>;

  searchArtistsAndTracks(query: string): Promise<{ artists: Artist[]; tracks: Track[] }>;

  getLiveSessions(): Promise<LiveSession[]>;
  getArtistStats(artistId: string): Promise<ArtistDailyStat[]>;

  getNotifications(userId?: string): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markAllNotificationsRead(userId?: string): Promise<void>;

  getRecommendations(): Promise<ARRecommendation[]>;
  updateRecommendation(id: string, status: string, reviewedBy?: string): Promise<ARRecommendation | undefined>;

  getPromotions(): Promise<Promotion[]>;
  createPromotion(data: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: string, status: string, approvedBy?: string): Promise<Promotion | undefined>;

  getRevenueByArtist(artistId?: string): Promise<RevenueDaily[]>;
  getRevenueSummary(): Promise<{ artistId: string; totalStreams: number; totalRevenue: number }[]>;

  getCalendarItems(): Promise<ContentCalendarItem[]>;
  updateCalendarItem(id: string, status: string, approvedBy?: string): Promise<ContentCalendarItem | undefined>;

  reorderPlaylist(id: string, trackIds: string[]): Promise<Playlist | undefined>;

  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(data: InsertAgent): Promise<Agent>;
  updateAgent(id: string, data: Partial<InsertAgent>): Promise<Agent | undefined>;

  getAgentTasks(status?: string): Promise<AgentTask[]>;
  getAgentTask(id: string): Promise<AgentTask | undefined>;
  createAgentTask(data: InsertAgentTask): Promise<AgentTask>;
  updateAgentTask(id: string, data: Partial<InsertAgentTask>): Promise<AgentTask | undefined>;

  getExecutionRuns(taskId?: string): Promise<ExecutionRun[]>;
  createExecutionRun(data: InsertExecutionRun): Promise<ExecutionRun>;

  getAgentMemory(agentId?: string): Promise<AgentMemory[]>;
  createAgentMemory(data: InsertAgentMemory): Promise<AgentMemory>;

  getCommandCenterBrief(): Promise<{
    totalAgents: number;
    activeAgents: number;
    pendingApprovals: number;
    runningTasks: number;
    completedToday: number;
    avgQualityScore: number;
  }>;
}

class DatabaseStorage implements IStorage {
  async getArtists(): Promise<Artist[]> {
    return db.select().from(artists).orderBy(desc(artists.monthlyListeners));
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }

  async createArtist(data: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(data).returning();
    return artist;
  }

  async updateArtist(id: string, data: Partial<InsertArtist>): Promise<Artist | undefined> {
    const [artist] = await db
      .update(artists)
      .set(data)
      .where(eq(artists.id, id))
      .returning();
    return artist;
  }

  async getTracks(): Promise<Track[]> {
    return db.select().from(tracks).orderBy(desc(tracks.plays));
  }

  async getTrack(id: string): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track;
  }

  async getTracksByArtist(artistId: string): Promise<Track[]> {
    return db
      .select()
      .from(tracks)
      .where(eq(tracks.artistId, artistId))
      .orderBy(desc(tracks.plays));
  }

  async createTrack(data: InsertTrack): Promise<Track> {
    const [track] = await db.insert(tracks).values(data).returning();
    return track;
  }

  async incrementPlays(trackId: string): Promise<void> {
    await db
      .update(tracks)
      .set({ plays: sql`${tracks.plays} + 1` })
      .where(eq(tracks.id, trackId));
  }

  async getPlaylists(): Promise<Playlist[]> {
    return db.select().from(playlists).orderBy(desc(playlists.createdAt));
  }

  async getPlaylistsByUser(userId: string): Promise<Playlist[]> {
    return db
      .select()
      .from(playlists)
      .where(
        or(
          eq(playlists.userId, userId),
          eq(playlists.isAutoGenerated, true)
        )
      )
      .orderBy(desc(playlists.createdAt));
  }

  async createPlaylist(data: InsertPlaylist): Promise<Playlist> {
    const [playlist] = await db.insert(playlists).values(data).returning();
    return playlist;
  }

  async updatePlaylist(id: string, data: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const [playlist] = await db
      .update(playlists)
      .set(data)
      .where(eq(playlists.id, id))
      .returning();
    return playlist;
  }

  async deletePlaylist(id: string): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  async getUserLikes(userId: string): Promise<string[]> {
    const rows = await db
      .select({ trackId: userLikes.trackId })
      .from(userLikes)
      .where(eq(userLikes.userId, userId));
    return rows.map((r) => r.trackId);
  }

  async toggleLike(userId: string, trackId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(userLikes)
      .where(and(eq(userLikes.userId, userId), eq(userLikes.trackId, trackId)));

    if (existing.length > 0) {
      await db
        .delete(userLikes)
        .where(and(eq(userLikes.userId, userId), eq(userLikes.trackId, trackId)));
      await db
        .update(tracks)
        .set({ likes: sql`GREATEST(${tracks.likes} - 1, 0)` })
        .where(eq(tracks.id, trackId));
      return false;
    } else {
      await db.insert(userLikes).values({ userId, trackId });
      await db
        .update(tracks)
        .set({ likes: sql`${tracks.likes} + 1` })
        .where(eq(tracks.id, trackId));
      return true;
    }
  }

  async getUserFollows(userId: string): Promise<string[]> {
    const rows = await db
      .select({ artistId: userFollows.artistId })
      .from(userFollows)
      .where(eq(userFollows.userId, userId));
    return rows.map((r) => r.artistId);
  }

  async toggleFollow(userId: string, artistId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(userFollows)
      .where(and(eq(userFollows.userId, userId), eq(userFollows.artistId, artistId)));

    if (existing.length > 0) {
      await db
        .delete(userFollows)
        .where(and(eq(userFollows.userId, userId), eq(userFollows.artistId, artistId)));
      return false;
    } else {
      await db.insert(userFollows).values({ userId, artistId });
      return true;
    }
  }

  async searchArtistsAndTracks(query: string): Promise<{ artists: Artist[]; tracks: Track[] }> {
    const pattern = `%${query}%`;
    const matchedArtists = await db
      .select()
      .from(artists)
      .where(or(ilike(artists.name, pattern), ilike(artists.genre, pattern)))
      .limit(5);
    const matchedTracks = await db
      .select()
      .from(tracks)
      .where(or(ilike(tracks.title, pattern), ilike(tracks.genre, pattern)))
      .limit(5);
    return { artists: matchedArtists, tracks: matchedTracks };
  }

  async getLiveSessions(): Promise<LiveSession[]> {
    return db.select().from(liveSessions).orderBy(asc(liveSessions.startsAt));
  }

  async getArtistStats(artistId: string): Promise<ArtistDailyStat[]> {
    return db
      .select()
      .from(artistDailyStats)
      .where(eq(artistDailyStats.artistId, artistId))
      .orderBy(asc(artistDailyStats.date));
  }

  async getNotifications(userId?: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(data).returning();
    return notif;
  }

  async markAllNotificationsRead(userId?: string): Promise<void> {
    await db.update(notifications).set({ isRead: true });
  }

  async getRecommendations(): Promise<ARRecommendation[]> {
    return db
      .select()
      .from(arRecommendations)
      .orderBy(desc(arRecommendations.createdAt));
  }

  async updateRecommendation(
    id: string,
    status: string,
    reviewedBy?: string
  ): Promise<ARRecommendation | undefined> {
    const [rec] = await db
      .update(arRecommendations)
      .set({ status, reviewedBy })
      .where(eq(arRecommendations.id, id))
      .returning();

    if (rec && status === "approved") {
      await db
        .update(artists)
        .set({ isSigned: true, isVerified: true, status: "signed" })
        .where(eq(artists.id, rec.artistId));
    }
    return rec;
  }

  async getPromotions(): Promise<Promotion[]> {
    return db
      .select()
      .from(promotions)
      .orderBy(desc(promotions.createdAt));
  }

  async createPromotion(data: InsertPromotion): Promise<Promotion> {
    const [promo] = await db.insert(promotions).values(data).returning();
    return promo;
  }

  async updatePromotion(
    id: string,
    status: string,
    approvedBy?: string
  ): Promise<Promotion | undefined> {
    const [promo] = await db
      .update(promotions)
      .set({ status, approvedBy })
      .where(eq(promotions.id, id))
      .returning();
    return promo;
  }

  async getRevenueByArtist(artistId?: string): Promise<RevenueDaily[]> {
    if (artistId) {
      return db
        .select()
        .from(revenueDaily)
        .where(eq(revenueDaily.artistId, artistId))
        .orderBy(asc(revenueDaily.date));
    }
    return db.select().from(revenueDaily).orderBy(asc(revenueDaily.date));
  }

  async getRevenueSummary(): Promise<{ artistId: string; totalStreams: number; totalRevenue: number }[]> {
    const rows = await db
      .select({
        artistId: revenueDaily.artistId,
        totalStreams: sql<number>`COALESCE(SUM(${revenueDaily.streams}), 0)::int`,
        totalRevenue: sql<number>`COALESCE(SUM(${revenueDaily.revenue}), 0)::int`,
      })
      .from(revenueDaily)
      .groupBy(revenueDaily.artistId);
    return rows;
  }

  async getCalendarItems(): Promise<ContentCalendarItem[]> {
    return db
      .select()
      .from(contentCalendar)
      .orderBy(asc(contentCalendar.scheduledAt));
  }

  async updateCalendarItem(
    id: string,
    status: string,
    approvedBy?: string
  ): Promise<ContentCalendarItem | undefined> {
    const [item] = await db
      .update(contentCalendar)
      .set({ status, approvedBy })
      .where(eq(contentCalendar.id, id))
      .returning();
    return item;
  }

  async reorderPlaylist(id: string, trackIds: string[]): Promise<Playlist | undefined> {
    const [playlist] = await db
      .update(playlists)
      .set({ trackIds })
      .where(eq(playlists.id, id))
      .returning();
    return playlist;
  }

  async getAgents(): Promise<Agent[]> {
    return db.select().from(agents).orderBy(asc(agents.name));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(data: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(data).returning();
    return agent;
  }

  async updateAgent(id: string, data: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [agent] = await db.update(agents).set(data).where(eq(agents.id, id)).returning();
    return agent;
  }

  async getAgentTasks(status?: string): Promise<AgentTask[]> {
    if (status) {
      return db.select().from(agentTasks).where(eq(agentTasks.status, status)).orderBy(desc(agentTasks.priorityScore));
    }
    return db.select().from(agentTasks).orderBy(desc(agentTasks.priorityScore));
  }

  async getAgentTask(id: string): Promise<AgentTask | undefined> {
    const [task] = await db.select().from(agentTasks).where(eq(agentTasks.id, id));
    return task;
  }

  async createAgentTask(data: InsertAgentTask): Promise<AgentTask> {
    const [task] = await db.insert(agentTasks).values(data).returning();
    return task;
  }

  async updateAgentTask(id: string, data: Partial<InsertAgentTask>): Promise<AgentTask | undefined> {
    const [task] = await db.update(agentTasks).set(data).where(eq(agentTasks.id, id)).returning();
    return task;
  }

  async getExecutionRuns(taskId?: string): Promise<ExecutionRun[]> {
    if (taskId) {
      return db.select().from(executionRuns).where(eq(executionRuns.taskId, taskId)).orderBy(desc(executionRuns.createdAt));
    }
    return db.select().from(executionRuns).orderBy(desc(executionRuns.createdAt));
  }

  async createExecutionRun(data: InsertExecutionRun): Promise<ExecutionRun> {
    const [run] = await db.insert(executionRuns).values(data).returning();
    return run;
  }

  async getAgentMemory(agentId?: string): Promise<AgentMemory[]> {
    if (agentId) {
      return db.select().from(agentMemory).where(eq(agentMemory.agentId, agentId)).orderBy(desc(agentMemory.createdAt));
    }
    return db.select().from(agentMemory).orderBy(desc(agentMemory.createdAt));
  }

  async createAgentMemory(data: InsertAgentMemory): Promise<AgentMemory> {
    const [mem] = await db.insert(agentMemory).values(data).returning();
    return mem;
  }

  async getCommandCenterBrief(): Promise<{
    totalAgents: number;
    activeAgents: number;
    pendingApprovals: number;
    runningTasks: number;
    completedToday: number;
    avgQualityScore: number;
  }> {
    const allAgents = await db.select().from(agents);
    const totalAgents = allAgents.length;
    const activeAgents = allAgents.filter(a => a.status === "active").length;

    const allTasks = await db.select().from(agentTasks);
    const pendingApprovals = allTasks.filter(t => t.status === "pending" && t.requiresApproval).length;
    const runningTasks = allTasks.filter(t => t.status === "running").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allRuns = await db.select().from(executionRuns);
    const completedToday = allRuns.filter(r => r.status === "completed" && r.createdAt && r.createdAt >= today).length;
    const scoredRuns = allRuns.filter(r => r.qualityScore !== null && r.qualityScore !== undefined);
    const avgQualityScore = scoredRuns.length > 0
      ? Math.round(scoredRuns.reduce((acc, r) => acc + (r.qualityScore ?? 0), 0) / scoredRuns.length * 10) / 10
      : 0;

    return { totalAgents, activeAgents, pendingApprovals, runningTasks, completedToday, avgQualityScore };
  }
}

export const storage = new DatabaseStorage();
