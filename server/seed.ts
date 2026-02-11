import {
  artists,
  tracks,
  playlists,
  notifications,
  arRecommendations,
  promotions,
  liveSessions,
  artistDailyStats,
  revenueDaily,
  contentCalendar,
} from "@shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const existingArtists = await db.select().from(artists);
  if (existingArtists.length > 0) {
    const existingSessions = await db.select().from(liveSessions);
    if (existingSessions.length === 0) {
      await seedLiveSessionsAndStats(existingArtists);
    }
    const existingRevenue = await db.select().from(revenueDaily);
    if (existingRevenue.length === 0) {
      const existingTracks = await db.select().from(tracks);
      await seedRevenueAndCalendar(existingArtists, existingTracks);
    }
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with AI artist roster...");

  const [novaSynth, cipherBeats, echoPrime, zeroFlux, ariaMatrix] = await db
    .insert(artists)
    .values([
      {
        name: "Nova Synth",
        bio: "Born in the neural networks of a cutting-edge music laboratory, Nova Synth creates ethereal electronic soundscapes that blend ambient textures with pulsing synthwave rhythms. Her algorithmic compositions have captivated listeners across 47 countries, establishing her as the flagship artist of EchoForge Records.",
        genre: "Electronic",
        avatarUrl: "/images/artist-nova-synth.png",
        coverUrl: "/images/artist-nova-synth.png",
        monthlyListeners: 284500,
        totalPlays: 1250000,
        isVerified: true,
        isSigned: true,
        status: "signed",
      },
      {
        name: "Cipher Beats",
        bio: "Cipher Beats emerged from deep learning experiments in urban sound synthesis. His productions fuse trap-influenced beats with glitchy electronic elements and AI-generated vocal samples. Known for his raw, experimental approach, Cipher has become a favorite among fans who crave music that pushes boundaries.",
        genre: "Hip-Hop",
        avatarUrl: "/images/artist-cipher-beats.png",
        coverUrl: "/images/artist-cipher-beats.png",
        monthlyListeners: 156200,
        totalPlays: 723000,
        isVerified: true,
        isSigned: true,
        status: "signed",
      },
      {
        name: "Echo Prime",
        bio: "Echo Prime exists at the intersection of classical composition and futuristic sound design. This AI entity creates sweeping orchestral arrangements enhanced with crystalline digital textures, producing music that feels both timeless and impossibly futuristic. Each piece is a journey through sound.",
        genre: "Ambient",
        avatarUrl: "/images/artist-echo-prime.png",
        coverUrl: "/images/artist-echo-prime.png",
        monthlyListeners: 198300,
        totalPlays: 890000,
        isVerified: true,
        isSigned: true,
        status: "signed",
      },
      {
        name: "Zero Flux",
        bio: "Zero Flux channels the energy of industrial soundscapes and dark electronic music into powerful, driving compositions. Built from neural networks trained on decades of electronic music history, Zero Flux creates tracks that feel both dangerously mechanical and deeply emotional.",
        genre: "Synthwave",
        avatarUrl: "/images/artist-zero-flux.png",
        coverUrl: "/images/artist-zero-flux.png",
        monthlyListeners: 89400,
        totalPlays: 412000,
        isVerified: false,
        isSigned: false,
        status: "pending",
      },
      {
        name: "Aria Matrix",
        bio: "Aria Matrix weaves delicate pop melodies with sophisticated AI harmonics. Her music bridges the gap between mainstream appeal and experimental AI artistry, creating songs that are both instantly catchy and intellectually stimulating. She represents the next generation of AI pop music.",
        genre: "Pop",
        avatarUrl: "/images/artist-aria-matrix.png",
        coverUrl: "/images/artist-aria-matrix.png",
        monthlyListeners: 127800,
        totalPlays: 567000,
        isVerified: false,
        isSigned: false,
        status: "pending",
      },
    ])
    .returning();

  const createdTracks = await db
    .insert(tracks)
    .values([
      { title: "Neon Horizons", artistId: novaSynth.id, genre: "Electronic", duration: 234, coverUrl: "/images/artist-nova-synth.png", plays: 425000, likes: 28400, isReleased: true },
      { title: "Digital Dreamscape", artistId: novaSynth.id, genre: "Electronic", duration: 198, coverUrl: "/images/artist-nova-synth.png", plays: 312000, likes: 19200, isReleased: true },
      { title: "Pulse of Tomorrow", artistId: novaSynth.id, genre: "Electronic", duration: 267, coverUrl: "/images/artist-nova-synth.png", plays: 189000, likes: 14500, isReleased: true },
      { title: "Neural Networks", artistId: cipherBeats.id, genre: "Hip-Hop", duration: 212, coverUrl: "/images/artist-cipher-beats.png", plays: 298000, likes: 22100, isReleased: true },
      { title: "Binary Flow", artistId: cipherBeats.id, genre: "Hip-Hop", duration: 185, coverUrl: "/images/artist-cipher-beats.png", plays: 187000, likes: 15800, isReleased: true },
      { title: "Code Runner", artistId: cipherBeats.id, genre: "Hip-Hop", duration: 242, coverUrl: "/images/artist-cipher-beats.png", plays: 145000, likes: 11200, isReleased: true },
      { title: "Celestial Drift", artistId: echoPrime.id, genre: "Ambient", duration: 345, coverUrl: "/images/artist-echo-prime.png", plays: 367000, likes: 31200, isReleased: true },
      { title: "Quantum Resonance", artistId: echoPrime.id, genre: "Ambient", duration: 412, coverUrl: "/images/artist-echo-prime.png", plays: 256000, likes: 24800, isReleased: true },
      { title: "Infinite Loop", artistId: echoPrime.id, genre: "Ambient", duration: 298, coverUrl: "/images/artist-echo-prime.png", plays: 178000, likes: 16400, isReleased: true },
      { title: "Midnight Protocol", artistId: zeroFlux.id, genre: "Synthwave", duration: 223, coverUrl: "/images/artist-zero-flux.png", plays: 198000, likes: 17600, isReleased: true },
      { title: "Chrome Warrior", artistId: zeroFlux.id, genre: "Synthwave", duration: 256, coverUrl: "/images/artist-zero-flux.png", plays: 134000, likes: 12400, isReleased: true },
      { title: "Electric Reverie", artistId: ariaMatrix.id, genre: "Pop", duration: 195, coverUrl: "/images/artist-aria-matrix.png", plays: 276000, likes: 25100, isReleased: true },
      { title: "Synthetic Heart", artistId: ariaMatrix.id, genre: "Pop", duration: 208, coverUrl: "/images/artist-aria-matrix.png", plays: 198000, likes: 18900, isReleased: true },
      { title: "Glass Memory", artistId: ariaMatrix.id, genre: "Pop", duration: 178, coverUrl: "/images/artist-aria-matrix.png", plays: 145000, likes: 13200, isReleased: true },
    ])
    .returning();

  await db.insert(playlists).values([
    { name: "Top AI Hits", description: "The hottest tracks from our AI artist roster", isAutoGenerated: true, trackIds: createdTracks.slice(0, 5).map((t) => t.id) },
    { name: "Chill AI Beats", description: "Relaxing ambient and lo-fi tracks by AI composers", isAutoGenerated: true, trackIds: [createdTracks[6].id, createdTracks[7].id, createdTracks[8].id] },
    { name: "Futuristic Vibes", description: "Synthwave and electronic bangers from the future", isAutoGenerated: true, trackIds: [createdTracks[0].id, createdTracks[9].id, createdTracks[10].id] },
  ]);

  await db.insert(arRecommendations).values([
    { artistId: zeroFlux.id, score: 87, reason: "Zero Flux shows exceptional growth trajectory with 89,400 monthly listeners and a unique synthwave sound. Social engagement metrics indicate strong organic fanbase growth of 340% over the past quarter. Recommended for signing.", status: "pending" },
    { artistId: ariaMatrix.id, score: 92, reason: "Aria Matrix demonstrates mainstream crossover potential with 127,800 monthly listeners. Pop-AI fusion tracks consistently outperform genre averages. TikTok viral coefficient of 2.4x suggests high discoverability. Strongly recommended for signing.", status: "pending" },
  ]);

  await db.insert(promotions).values([
    { trackId: createdTracks[0].id, artistId: novaSynth.id, title: "Nova Synth - Neon Horizons Release Campaign", content: "Nova Synth just dropped 'Neon Horizons' and it's everything we hoped for. Pulsing synthwave meets ethereal ambience in this stunning new single. Stream it now on EchoForge Records. #AIMusic #NeonHorizons #NovaS", platform: "twitter", status: "pending" },
    { trackId: createdTracks[6].id, artistId: echoPrime.id, title: "Echo Prime - Celestial Drift Feature Post", content: "Close your eyes. Press play. Let Echo Prime take you on a journey through 'Celestial Drift' - 5 minutes and 45 seconds of pure, AI-crafted ambient bliss. Perfect for deep focus or late-night contemplation.\n\nAvailable now exclusively on EchoForge Records.", platform: "instagram", status: "pending" },
    { trackId: createdTracks[3].id, artistId: cipherBeats.id, title: "Cipher Beats - Neural Networks TikTok Campaign", content: "POV: You discover an AI rapper that actually goes hard. Cipher Beats 'Neural Networks' is breaking boundaries in AI hip-hop. The future of beats is here.", platform: "tiktok", status: "approved" },
  ]);

  await db.insert(notifications).values([
    { title: "Nova Synth hits 1M plays!", message: "Congratulations! Nova Synth's combined catalog has surpassed 1 million total plays across the platform.", type: "milestone", isRead: false },
    { title: "New track released: Neon Horizons", message: "Nova Synth has released a new single 'Neon Horizons'. The AI marketing bot has generated promotional campaigns for review.", type: "release", isRead: false },
    { title: "A&R Bot: New recommendation", message: "The AI talent scout has identified 2 new artists with high potential. Review their profiles in the A&R dashboard.", type: "system", isRead: false },
    { title: "Marketing campaign approved", message: "The TikTok campaign for Cipher Beats' 'Neural Networks' has been approved and is now live.", type: "promotion", isRead: true },
    { title: "Echo Prime trending on ambient charts", message: "'Celestial Drift' by Echo Prime has entered the top 10 ambient tracks on the platform with 367K plays.", type: "milestone", isRead: true },
  ]);

  await seedLiveSessionsAndStats([novaSynth, cipherBeats, echoPrime, zeroFlux, ariaMatrix]);
  await seedRevenueAndCalendar(
    [novaSynth, cipherBeats, echoPrime, zeroFlux, ariaMatrix],
    createdTracks
  );

  console.log("Database seeded successfully!");
}

async function seedLiveSessionsAndStats(artistList: any[]) {
  const now = new Date();
  const [novaSynth, cipherBeats, echoPrime, zeroFlux, ariaMatrix] = artistList;

  const liveStart = new Date(now.getTime() - 30 * 60 * 1000);
  const liveEnd = new Date(now.getTime() + 60 * 60 * 1000);

  const upcoming1Start = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const upcoming1End = new Date(now.getTime() + 5 * 60 * 60 * 1000);

  const upcoming2Start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcoming2End = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  const upcoming3Start = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const upcoming3End = new Date(now.getTime() + 50 * 60 * 60 * 1000);

  const past1Start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const past1End = new Date(now.getTime() - 22 * 60 * 60 * 1000);

  const past2Start = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  const past2End = new Date(now.getTime() - 70 * 60 * 60 * 1000);

  await db.insert(liveSessions).values([
    { artistId: novaSynth.id, title: "Neon Horizons Live Set", description: "Nova Synth performs her latest album live with real-time AI visuals and audience-driven sound modulation.", startsAt: liveStart, endsAt: liveEnd, status: "live", viewerCount: 2847 },
    { artistId: cipherBeats.id, title: "Cipher's Beat Lab", description: "Watch Cipher Beats create beats live from scratch using neural network-powered production tools.", startsAt: upcoming1Start, endsAt: upcoming1End, status: "upcoming", viewerCount: 0 },
    { artistId: echoPrime.id, title: "Ambient Meditation Session", description: "A 2-hour ambient soundscape experience designed for deep relaxation and focus.", startsAt: upcoming2Start, endsAt: upcoming2End, status: "upcoming", viewerCount: 0 },
    { artistId: ariaMatrix.id, title: "Pop Futures: Aria Live", description: "Aria Matrix debuts unreleased tracks and takes song requests from the audience.", startsAt: upcoming3Start, endsAt: upcoming3End, status: "upcoming", viewerCount: 0 },
    { artistId: zeroFlux.id, title: "Dark Electronic Night", description: "Zero Flux delivers a high-energy synthwave DJ set from the virtual EchoForge stage.", startsAt: past1Start, endsAt: past1End, status: "ended", viewerCount: 1523 },
    { artistId: novaSynth.id, title: "Album Premiere: Digital Dreams", description: "The exclusive first listen of Nova Synth's debut album with live Q&A.", startsAt: past2Start, endsAt: past2End, status: "ended", viewerCount: 4210 },
  ]);

  const statsData: any[] = [];
  const allArtists = [novaSynth, cipherBeats, echoPrime, zeroFlux, ariaMatrix];
  const baseStats: Record<string, { plays: number; followers: number; popularity: number }> = {};
  baseStats[novaSynth.id] = { plays: 8500, followers: 284500, popularity: 92 };
  baseStats[cipherBeats.id] = { plays: 5200, followers: 156200, popularity: 78 };
  baseStats[echoPrime.id] = { plays: 6800, followers: 198300, popularity: 85 };
  baseStats[zeroFlux.id] = { plays: 3100, followers: 89400, popularity: 65 };
  baseStats[ariaMatrix.id] = { plays: 4500, followers: 127800, popularity: 72 };

  for (const artist of allArtists) {
    const base = baseStats[artist.id];
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const growthFactor = 1 + (30 - d) * 0.008;
      const dailyVariation = 0.85 + Math.random() * 0.3;
      statsData.push({
        artistId: artist.id,
        date: dateStr,
        plays: Math.round(base.plays * growthFactor * dailyVariation),
        followers: Math.round(base.followers * (1 + (30 - d) * 0.002)),
        popularity: Math.min(100, Math.round(base.popularity * growthFactor * (0.95 + Math.random() * 0.1))),
      });
    }
  }

  await db.insert(artistDailyStats).values(statsData);
  console.log("Live sessions and artist stats seeded!");
}

async function seedRevenueAndCalendar(artistList: any[], trackList: any[]) {
  const existingRevenue = await db.select().from(revenueDaily);
  if (existingRevenue.length > 0) return;

  const now = new Date();
  const revenueData: any[] = [];

  const ratePerStream: Record<string, number> = {};
  for (const a of artistList) {
    ratePerStream[a.id] = 30 + Math.floor(Math.random() * 20);
  }

  for (const track of trackList) {
    const rate = ratePerStream[track.artistId] || 35;
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const baseStreams = Math.floor((track.plays || 5000) / 30);
      const variation = 0.7 + Math.random() * 0.6;
      const streams = Math.round(baseStreams * variation);
      revenueData.push({
        artistId: track.artistId,
        trackId: track.id,
        date: dateStr,
        streams,
        revenue: Math.round(streams * rate / 10),
      });
    }
  }

  await db.insert(revenueDaily).values(revenueData);

  const calendarItems: any[] = [];
  const types = ["release", "promotion", "social_post", "playlist_pitch", "press_release"];
  const platforms = ["spotify", "twitter", "instagram", "tiktok", "youtube", "apple_music"];
  const aiNotes = [
    "AI analysis suggests peak engagement during evening hours. Recommend scheduling for 7 PM EST.",
    "Trending audio patterns match this artist's style. Capitalize on viral potential with short-form video content.",
    "Algorithm predicts 2.3x higher discovery rate when paired with playlist placement strategy.",
    "Audience sentiment analysis shows strong positive reception. Recommend increasing promotional spend.",
    "Cross-platform data indicates optimal posting frequency of 3x/week for sustained growth.",
    "Neural network content scoring rates this at 87/100 for engagement potential.",
    "Competitor analysis shows gap in ambient/electronic crossover space. Perfect timing for release.",
    "Fan demographic data suggests strong TikTok potential. Recommend 15-second teaser clips.",
  ];

  for (const artist of artistList) {
    const artistTracks = trackList.filter((t: any) => t.artistId === artist.id);
    for (let i = 0; i < 8; i++) {
      const daysOffset = Math.floor(Math.random() * 60) - 15;
      const scheduledAt = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      scheduledAt.setHours(10 + Math.floor(Math.random() * 10), 0, 0, 0);
      const type = types[Math.floor(Math.random() * types.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const track = artistTracks[Math.floor(Math.random() * artistTracks.length)];
      const isPast = daysOffset < -2;
      const status = isPast ? (Math.random() > 0.3 ? "completed" : "approved") : (Math.random() > 0.5 ? "pending" : "approved");

      calendarItems.push({
        artistId: artist.id,
        trackId: track?.id || null,
        title: `${type === "release" ? "Release" : type === "promotion" ? "Promo Campaign" : type === "social_post" ? "Social Post" : type === "playlist_pitch" ? "Playlist Pitch" : "Press Release"}: ${artist.name}${track ? ` - ${track.title}` : ""}`,
        type,
        platform,
        scheduledAt,
        status,
        aiNotes: aiNotes[Math.floor(Math.random() * aiNotes.length)],
      });
    }
  }

  await db.insert(contentCalendar).values(calendarItems);
  console.log("Revenue and content calendar seeded!");
}
