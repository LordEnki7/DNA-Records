# EchoForge Records - AI Record Label Platform

## Overview
EchoForge Records is the world's first AI-powered record label platform, a division of Project DNA Music. It signs, promotes, and manages AI virtual artists using agentic technology with human oversight on all decisions.

## Recent Changes
- **Feb 2026**: Enhanced platform with advanced features
  - Music player: queue management (add/play next/remove/clear), shuffle/repeat modes, keyboard shortcuts (Space, arrows), expandable mini-player with album art
  - 5-band equalizer with presets (Flat, Bass Boost, V-Shape, etc.), localStorage persistence, accessible from player bar
  - Revenue dashboard admin page with summary cards, revenue-over-time chart, artist breakdown table, per-artist filtering
  - AI content calendar admin page with filter tabs, artist filter, approve/reject workflow for pending items
  - Drag-and-drop playlist reordering using @dnd-kit in Library
  - Database schema: revenueDaily and contentCalendar tables with seed data (420 revenue records, 40 calendar items)
- **Feb 2026**: Initial MVP built with full frontend/backend integration
  - Futuristic dark theme with orange neon accents matching the EchoForge logo
  - Replit Auth for user authentication
  - PostgreSQL database with seeded AI artist roster
  - Music player with simulated playback
  - A&R Scout and Marketing admin dashboards

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect)
- **Charts**: recharts (for revenue dashboard)
- **DnD**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities

### Project Structure
```
client/src/
├── pages/           # Route pages (home, discover, artist, library, live, notifications, admin, admin-ar, admin-marketing, admin-revenue, admin-calendar)
├── components/      # Shared components (app-sidebar, music-player, equalizer-panel, theme-provider, theme-toggle, global-search)
├── hooks/           # Custom hooks (use-auth, use-toast, use-interactions)
├── lib/             # Utilities (queryClient, auth-utils, utils, audio-engine)
server/
├── index.ts         # Express server entry
├── routes.ts        # API routes
├── storage.ts       # Database storage layer
├── db.ts            # Database connection
├── seed.ts          # Seed data for AI artists, revenue, calendar
├── replit_integrations/auth/  # Replit Auth integration
shared/
├── schema.ts        # Drizzle schema + types
├── models/auth.ts   # Auth-related schema
```

### Key Data Models
- **Artists**: AI virtual artists with profiles, genres, play counts
- **Tracks**: Music tracks with metadata, play/like counts
- **Playlists**: Auto-generated and user playlists with reorderable trackIds
- **Notifications**: System notifications for milestones, releases
- **AR Recommendations**: AI A&R bot talent recommendations
- **Promotions**: AI-generated marketing campaigns
- **RevenueDaily**: Daily revenue/streams per artist per track
- **ContentCalendar**: AI-generated scheduled content items with approval workflow

### API Routes
- `GET /api/artists` - List all artists
- `GET /api/artists/:id` - Get artist by ID
- `GET /api/artists/:id/tracks` - Get tracks for artist
- `GET /api/tracks` - List all tracks
- `POST /api/tracks/:id/play` - Increment play count
- `GET /api/playlists` - List playlists
- `POST /api/playlists` - Create playlist
- `PATCH /api/playlists/:id` - Update playlist
- `PATCH /api/playlists/:id/reorder` - Reorder playlist tracks (body: {trackIds})
- `GET /api/notifications` - List notifications
- `POST /api/notifications/read-all` - Mark all read
- `GET /api/admin/recommendations` - A&R recommendations
- `PATCH /api/admin/recommendations/:id` - Approve/reject
- `GET /api/admin/promotions` - Marketing promotions
- `PATCH /api/admin/promotions/:id` - Approve/reject
- `GET /api/admin/revenue` - Revenue data (optional ?artistId filter)
- `GET /api/admin/revenue/summary` - Revenue summary per artist
- `GET /api/admin/calendar` - Content calendar items
- `PATCH /api/admin/calendar/:id` - Update calendar item status

### Design
- Dark theme default with orange/amber neon accents (hsl 25, 95%, 53%)
- Font: Space Grotesk (sans) + JetBrains Mono (mono)
- Custom CSS animations: neon-pulse, float-up, glow effects
- Glass panel effects for overlays
- Sidebar navigation with SidebarProvider

## User Preferences
- Project DNA Music branding (parent company)
- Human verification on all AI decisions
- Futuristic sci-fi aesthetic
