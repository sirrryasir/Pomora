# Pomora

A premium study ecosystem featuring a high-end **Web Timer** and a feature-rich **Discord Bot**, designed to help you master your focus.

> **Focus. Flow. Pomora.**

## MVP Features

### Discord Bot (The Core)
- **Room-Centric Timers**: Real-time Focus/Break cycles directly in voice channels.
- **Dynamic Channel Names**: Voice channels update their names to show the current phase and time remaining.
- **Presence System**: Tracks who is active or away during sessions.
- **Voice Alerts**: Professional voice notifications for state changes (Focus/Break).
- **Admin Setup**: Easy configuration with `!setup` and `!config` commands.

### Visual Leaderboards
- **Automated Reporting**: Daily, Weekly, and Monthly reports generated as beautiful images.
- **LionBot-Inspired Layout**: High-end podiums, crowns, and sleek ranking lists.

### Web Dashboard
- **Live Sync**: View your current study session timer in real-time on the web.
- **Personalized Access**: Secure Google Authentication and Supabase integration.
- **Premium UI**: Modern dark-mode aesthetic with smooth transitions and responsive design.

## Tech Stack
- **Languages**: TypeScript, HTML, CSS
- **Frontend**: Next.js, TalwindCSS, Framer Motion
- **Backend/Bot**: Node.js, Discord.js, @napi-rs/canvas
- **Database/Auth**: Supabase, PostgreSQL
- **Runtime**: Bun

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed.
- A Discord Bot token from the [Discord Developer Portal](https://discord.com/developers/applications).
- A [Supabase](https://supabase.com) project for database and auth.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sirrryasir/pomora.git
   cd pomora
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Configure Environment Variables**:
   Create `.env` files in `apps/bot` and `apps/web`:
   
   **`apps/bot/.env`**:
   ```env
   DISCORD_TOKEN=your_token
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   ```

   **`apps/web/.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Run the applications**:

   **Start the Bot**:
   ```bash
   cd apps/bot
   bun run build
   bun run start
   ```

   **Start the Web Dashboard**:
   ```bash
   cd apps/web
   bun run dev
   ```

## Documentation
- [Bot Documentation](apps/bot/README.md)
- [Web Documentation](apps/web/README.md)

---
*Built with dedication for the Pomora community.*
