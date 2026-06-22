# Pomora - Discord Pomodoro Timer Bot with Dashboard

Multi-user Pomodoro timer bot for Discord with customizable focus/break sessions and leaderboard tracking.

## What It Does

Pomora runs productivity timer sessions in Discord channels. Multiple users join a focus room, get customizable work/break cycles, and compete on leaderboards. Includes web dashboard for analytics.

## Features

Timer System:
- Focus and break sessions (default: 50 min focus, 10 min break)
- Customizable session durations
- Sound and voice notifications
- Multi-user rooms (one timer per Discord channel)
- Tracks participants and missed sessions

Tracking:
- Records sessions completed per user
- Tracks missed ticks (skipped sessions)
- Leaderboard by guild

Discord Integration:
- Commands in Discord
- Voice channel support
- Keyboard shortcut commands
- Welcome messages

Web Dashboard:
- User login system
- Timer page to see active sessions
- Bot documentation
- Leaderboard view

## Tech Stack

Bot:
- Node.js + discord.js (v14)
- TypeScript
- Prisma ORM (database)
- Bun package manager

Web Dashboard:
- Next.js 15
- React 19
- TypeScript
- TailwindCSS

Database:
- Prisma (type specified in bot package, likely PostgreSQL or MongoDB)

## How It Works

1. User runs Discord bot command in a channel
2. Timer room created (first time only)
3. Multiple users can join same timer
4. Focus and break cycles run
5. Users mark themselves "present" or miss ticks
6. Sessions tracked in database
7. Dashboard shows stats and leaderboards

## Project Structure

```
pomora/
├── bot/                 Discord bot
│   ├── src/
│   │   ├── index.ts
│   │   └── services/
│   │       ├── TimerService.ts
│   │       ├── DatabaseService.ts
│   │       ├── LeaderboardReporter.ts
│   │       └── ...
├── web/                 Next.js dashboard
│   ├── app/
│   │   ├── page.tsx
│   │   ├── timer/page.tsx
│   │   ├── bot/page.tsx
│   │   └── login/page.tsx
└── bun.lock
```

## Installation

```bash
git clone https://github.com/sirrryasir/pomora.git
cd pomora
bun install
```

Bot:
```bash
bun run dev:bot
```

Dashboard:
```bash
bun run dev:web
```

## Environment

Bot needs:
- DISCORD_TOKEN
- DATABASE_URL
- FOCUS_TIME (minutes, default 50)
- SHORT_BREAK (minutes, default 10)

## License

MIT
