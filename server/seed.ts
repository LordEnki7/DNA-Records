import {
  artists,
  tracks,
  playlists,
  notifications,
  arRecommendations,
  promotions,
} from "@shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const existingArtists = await db.select().from(artists);
  if (existingArtists.length > 0) {
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
      {
        title: "Neon Horizons",
        artistId: novaSynth.id,
        genre: "Electronic",
        duration: 234,
        coverUrl: "/images/artist-nova-synth.png",
        plays: 425000,
        likes: 28400,
        isReleased: true,
      },
      {
        title: "Digital Dreamscape",
        artistId: novaSynth.id,
        genre: "Electronic",
        duration: 198,
        coverUrl: "/images/artist-nova-synth.png",
        plays: 312000,
        likes: 19200,
        isReleased: true,
      },
      {
        title: "Pulse of Tomorrow",
        artistId: novaSynth.id,
        genre: "Electronic",
        duration: 267,
        coverUrl: "/images/artist-nova-synth.png",
        plays: 189000,
        likes: 14500,
        isReleased: true,
      },
      {
        title: "Neural Networks",
        artistId: cipherBeats.id,
        genre: "Hip-Hop",
        duration: 212,
        coverUrl: "/images/artist-cipher-beats.png",
        plays: 298000,
        likes: 22100,
        isReleased: true,
      },
      {
        title: "Binary Flow",
        artistId: cipherBeats.id,
        genre: "Hip-Hop",
        duration: 185,
        coverUrl: "/images/artist-cipher-beats.png",
        plays: 187000,
        likes: 15800,
        isReleased: true,
      },
      {
        title: "Code Runner",
        artistId: cipherBeats.id,
        genre: "Hip-Hop",
        duration: 242,
        coverUrl: "/images/artist-cipher-beats.png",
        plays: 145000,
        likes: 11200,
        isReleased: true,
      },
      {
        title: "Celestial Drift",
        artistId: echoPrime.id,
        genre: "Ambient",
        duration: 345,
        coverUrl: "/images/artist-echo-prime.png",
        plays: 367000,
        likes: 31200,
        isReleased: true,
      },
      {
        title: "Quantum Resonance",
        artistId: echoPrime.id,
        genre: "Ambient",
        duration: 412,
        coverUrl: "/images/artist-echo-prime.png",
        plays: 256000,
        likes: 24800,
        isReleased: true,
      },
      {
        title: "Infinite Loop",
        artistId: echoPrime.id,
        genre: "Ambient",
        duration: 298,
        coverUrl: "/images/artist-echo-prime.png",
        plays: 178000,
        likes: 16400,
        isReleased: true,
      },
      {
        title: "Midnight Protocol",
        artistId: zeroFlux.id,
        genre: "Synthwave",
        duration: 223,
        coverUrl: "/images/artist-zero-flux.png",
        plays: 198000,
        likes: 17600,
        isReleased: true,
      },
      {
        title: "Chrome Warrior",
        artistId: zeroFlux.id,
        genre: "Synthwave",
        duration: 256,
        coverUrl: "/images/artist-zero-flux.png",
        plays: 134000,
        likes: 12400,
        isReleased: true,
      },
      {
        title: "Electric Reverie",
        artistId: ariaMatrix.id,
        genre: "Pop",
        duration: 195,
        coverUrl: "/images/artist-aria-matrix.png",
        plays: 276000,
        likes: 25100,
        isReleased: true,
      },
      {
        title: "Synthetic Heart",
        artistId: ariaMatrix.id,
        genre: "Pop",
        duration: 208,
        coverUrl: "/images/artist-aria-matrix.png",
        plays: 198000,
        likes: 18900,
        isReleased: true,
      },
      {
        title: "Glass Memory",
        artistId: ariaMatrix.id,
        genre: "Pop",
        duration: 178,
        coverUrl: "/images/artist-aria-matrix.png",
        plays: 145000,
        likes: 13200,
        isReleased: true,
      },
    ])
    .returning();

  await db.insert(playlists).values([
    {
      name: "Top AI Hits",
      description: "The hottest tracks from our AI artist roster",
      isAutoGenerated: true,
      trackIds: createdTracks.slice(0, 5).map((t) => t.id),
    },
    {
      name: "Chill AI Beats",
      description: "Relaxing ambient and lo-fi tracks by AI composers",
      isAutoGenerated: true,
      trackIds: [createdTracks[6].id, createdTracks[7].id, createdTracks[8].id],
    },
    {
      name: "Futuristic Vibes",
      description: "Synthwave and electronic bangers from the future",
      isAutoGenerated: true,
      trackIds: [createdTracks[0].id, createdTracks[9].id, createdTracks[10].id],
    },
  ]);

  await db.insert(arRecommendations).values([
    {
      artistId: zeroFlux.id,
      score: 87,
      reason:
        "Zero Flux shows exceptional growth trajectory with 89,400 monthly listeners and a unique synthwave sound. Social engagement metrics indicate strong organic fanbase growth of 340% over the past quarter. Recommended for signing.",
      status: "pending",
    },
    {
      artistId: ariaMatrix.id,
      score: 92,
      reason:
        "Aria Matrix demonstrates mainstream crossover potential with 127,800 monthly listeners. Pop-AI fusion tracks consistently outperform genre averages. TikTok viral coefficient of 2.4x suggests high discoverability. Strongly recommended for signing.",
      status: "pending",
    },
  ]);

  await db.insert(promotions).values([
    {
      trackId: createdTracks[0].id,
      artistId: novaSynth.id,
      title: "Nova Synth - Neon Horizons Release Campaign",
      content:
        "Nova Synth just dropped 'Neon Horizons' and it's everything we hoped for. Pulsing synthwave meets ethereal ambience in this stunning new single. Stream it now on EchoForge Records. #AIMusic #NeonHorizons #NovaS",
      platform: "twitter",
      status: "pending",
    },
    {
      trackId: createdTracks[6].id,
      artistId: echoPrime.id,
      title: "Echo Prime - Celestial Drift Feature Post",
      content:
        "Close your eyes. Press play. Let Echo Prime take you on a journey through 'Celestial Drift' - 5 minutes and 45 seconds of pure, AI-crafted ambient bliss. Perfect for deep focus or late-night contemplation.\n\nAvailable now exclusively on EchoForge Records.",
      platform: "instagram",
      status: "pending",
    },
    {
      trackId: createdTracks[3].id,
      artistId: cipherBeats.id,
      title: "Cipher Beats - Neural Networks TikTok Campaign",
      content:
        "POV: You discover an AI rapper that actually goes hard. Cipher Beats 'Neural Networks' is breaking boundaries in AI hip-hop. The future of beats is here.",
      platform: "tiktok",
      status: "approved",
    },
  ]);

  await db.insert(notifications).values([
    {
      title: "Nova Synth hits 1M plays!",
      message:
        "Congratulations! Nova Synth's combined catalog has surpassed 1 million total plays across the platform.",
      type: "milestone",
      isRead: false,
    },
    {
      title: "New track released: Neon Horizons",
      message:
        "Nova Synth has released a new single 'Neon Horizons'. The AI marketing bot has generated promotional campaigns for review.",
      type: "release",
      isRead: false,
    },
    {
      title: "A&R Bot: New recommendation",
      message:
        "The AI talent scout has identified 2 new artists with high potential. Review their profiles in the A&R dashboard.",
      type: "system",
      isRead: false,
    },
    {
      title: "Marketing campaign approved",
      message:
        "The TikTok campaign for Cipher Beats' 'Neural Networks' has been approved and is now live.",
      type: "promotion",
      isRead: true,
    },
    {
      title: "Echo Prime trending on ambient charts",
      message:
        "'Celestial Drift' by Echo Prime has entered the top 10 ambient tracks on the platform with 367K plays.",
      type: "milestone",
      isRead: true,
    },
  ]);

  console.log("Database seeded successfully!");
}
