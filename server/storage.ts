import {
  artists,
  tracks,
  playlists,
  userLikes,
  notifications,
  arRecommendations,
  promotions,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

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
  createPlaylist(data: InsertPlaylist): Promise<Playlist>;

  getNotifications(userId?: string): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markAllNotificationsRead(userId?: string): Promise<void>;

  getRecommendations(): Promise<ARRecommendation[]>;
  updateRecommendation(id: string, status: string, reviewedBy?: string): Promise<ARRecommendation | undefined>;

  getPromotions(): Promise<Promotion[]>;
  createPromotion(data: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: string, status: string, approvedBy?: string): Promise<Promotion | undefined>;
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

  async createPlaylist(data: InsertPlaylist): Promise<Playlist> {
    const [playlist] = await db.insert(playlists).values(data).returning();
    return playlist;
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
}

export const storage = new DatabaseStorage();
