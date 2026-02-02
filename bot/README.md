# Pomora Bot
**The heartbeat of the Pomora ecosystem.**

The Pomora Discord bot manages voice channel productivity sessions, tracks user time, and generates visual reports.

## Main Commands

### Administrator Only
- `!setup [channel-mention]`: Set the designated channel for automated reports.
- `!config`: View current server settings.
- `!test-report [daily|weekly|monthly]`: Generate an immediate visual report preview.

### User Commands
- `!stats`: View your personal study statistics (Coming soon).
- `!help`: Detailed command list.

## Core Architecture
- **TimerService**: Manages room-centric state and interval logic.
- **ImageService**: High-performance canvas rendering for leaderboards and status cards.
- **LeaderboardReporter**: Handles automated scheduling and broadcasting of reports.
- **DatabaseService**: Direct integration with Supabase (PostgreSQL).
- **VoiceManager**: Handles voice connections and audio alerts.

## Development

### Build and Run
```bash
bun run build
bun run start
```

### Environment
Ensure `DISCORD_TOKEN`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` are set in `.env`.

---
*Pomora Bot • Premium Productivity*
