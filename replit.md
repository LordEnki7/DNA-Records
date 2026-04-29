# DNA Records - AI Record Label Platform

## Overview
DNA Records is the world's first AI-powered record label platform, a division of Project DNA Music. It signs, promotes, and manages AI virtual artists using agentic technology with human oversight on all decisions.

## Recent Changes
- **Mar 2026**: AI Agent Command Center built from agent infrastructure docs
  - Agent Registry page: view/manage 8 AI agents (A&R Scout, Marketing Director, Revenue Optimizer, Content Creator, Research Intelligence, System Optimizer, Daily Orchestrator, Growth Engine) with status toggle (active/idle/disabled)
  - Task Queue page: full task assignment system with approval/reject workflow, priority scores (1-100), urgency levels, execution log viewer with action logs, quality scores, lessons learned
  - Command Center page: Daily Executive Brief with live metrics, top priority actions, approval queue, quick wins, shared agent memory/insights, end-of-day targets
  - 4 new DB tables: agents, agent_tasks, execution_runs, agent_memory with full CRUD API
  - New admin sidebar nav: Command Center, Agent Registry, Task Queue
- **Feb 2026**: Enhanced platform with advanced features
  - Music player: queue management (add/play next/remove/clear), shuffle/repeat modes, keyboard shortcuts (Space, arrows), expandable mini-player with album art
  - 5-band equalizer with presets (Flat, Bass Boost, V-Shape, etc.), localStorage persistence, accessible from player bar
  - Revenue dashboard admin page with summary cards, revenue-over-time chart, artist breakdown table, per-artist filtering
  - AI content calendar admin page with filter tabs, artist filter, approve/reject workflow for pending items
  - Drag-and-drop playlist reordering using @dnd-kit in Library
  - Database schema: revenueDaily and contentCalendar tables with seed data (420 revenue records, 40 calendar items)
- **Feb 2026**: Initial MVP built with full frontend/backend integration
  - Futuristic dark theme with orange neon accents matching the DNA Records logo
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

## Agent Safety Rules — Read Before Touching the Database or Files

These rules exist to prevent catastrophic, unrecoverable mistakes.
An AI agent deleted an entire production database in 9 seconds once.
Don't be that agent.

### Database Rules

1. NEVER drop a table, truncate a table, or delete all rows from a table.
   If you think you need to, stop and ask the user first.

2. NEVER delete a user row directly. Use a soft delete:
   set account_status = 'deleted' and deleted_at = now(). Keep the row.

3. NEVER run seeders against a production database.
   Check NODE_ENV and DATABASE_URL before running any seed script.
   If either points to production, throw an error and stop.

4. NEVER change the type of a primary key column (e.g. serial ↔ varchar).
   This generates destructive ALTER TABLE statements that break everything.
   Check the existing schema first and match it exactly.

5. Before ANY bulk delete operation in production, require explicit
   human confirmation — not just a flag, an actual user approval step.

6. Log every destructive operation before it runs:
   who, what table, what record, why, timestamp.

### File and Secrets Rules

7. NEVER print, log, or write a secret/API key/token to a file or console.

8. NEVER modify package.json scripts without asking the user first.

9. NEVER modify the Vite config (vite.config.ts, server/vite.ts).

10. NEVER create documentation files (README, markdown) unless explicitly asked.

### General Rules

11. Do exactly what was asked. No additions, no subtractions.

12. Don't use placeholder or mock data unless the user specifically requests it.

13. If something feels risky or irreversible — stop and ask.
    It costs 30 seconds. Recovery costs hours or days.

14. Clean up all debug code, test files, and console.log statements
    before marking a task complete.
