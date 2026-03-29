/**
 * NIG COMMAND CENTER — Division Status Endpoint
 * DNA Records division (dnarecords)
 * Reports real-time health and metrics to the NIG Command Center.
 */

import type { RequestHandler } from "express";
import { db } from "./db";
import { artists, tracks, agents, agentTasks, revenueDaily } from "@shared/schema";
import { eq, sql, and, gte } from "drizzle-orm";

const NIG_API_KEY = process.env.NIG_API_KEY;
const DIVISION_NAME = process.env.DIVISION_NAME || "dnarecords";

async function getMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  // Parallel DB queries for speed
  const [
    artistRows,
    trackRows,
    activeAgentRows,
    taskRows,
    revenueRows,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(artists),
    db.select({
      count: sql<number>`count(*)`,
      totalPlays: sql<number>`coalesce(sum(${tracks.plays}), 0)`,
    }).from(tracks),
    db.select({ count: sql<number>`count(*)` }).from(agents)
      .where(eq(agents.status, "active")),
    db.select({ count: sql<number>`count(*)` }).from(agentTasks)
      .where(eq(agentTasks.status, "pending")),
    db.select({
      total: sql<number>`coalesce(sum(${revenueDaily.revenue}), 0)`,
    }).from(revenueDaily)
      .where(gte(revenueDaily.date, thirtyDaysAgoStr)),
  ]);

  const artistCount = Number(artistRows[0]?.count ?? 0);
  const trackCount = Number(trackRows[0]?.count ?? 0);
  const totalPlays = Number(trackRows[0]?.totalPlays ?? 0);
  const activeAgents = Number(activeAgentRows[0]?.count ?? 0);
  const pendingTasks = Number(taskRows[0]?.count ?? 0);
  const monthlyRevenue = Number(revenueRows[0]?.total ?? 0);

  // Health score: deduct points for unhealthy signs
  let health = 100;
  if (activeAgents === 0) health -= 20;
  if (pendingTasks > 20) health -= 10;

  return {
    status: "live" as const,
    health,
    activeUsers: activeAgents,        // active AI agents as proxy for activity
    revenue: Math.round(monthlyRevenue),
    subscribers: artistCount,         // signed AI artists
    uptime: 99.9,

    metrics: {
      ai_artists: artistCount,
      total_tracks: trackCount,
      total_plays: totalPlays,
      active_agents: activeAgents,
      pending_tasks: pendingTasks,
      monthly_revenue_usd: Math.round(monthlyRevenue),
    },

    message: health >= 90
      ? "All systems operational"
      : health >= 70
      ? "Systems running with minor issues"
      : "Degraded — attention required",
  };
}

export const nigStatusHandler: RequestHandler = async (req, res) => {
  // Validate API key
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (NIG_API_KEY && token !== NIG_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const metrics = await getMetrics();
    return res.status(200).json({
      ...metrics,
      division: DIVISION_NAME,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "offline",
      health: 0,
      error: err.message,
      division: DIVISION_NAME,
      timestamp: new Date().toISOString(),
    });
  }
};
