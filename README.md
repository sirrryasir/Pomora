# 🍅 Pomora - Time-Based Productivity Bot & Web Dashboard

<div align="center">
  <p>
    <a href="https://github.com/sirrryasir/pomora"><img src="https://img.shields.io/badge/Discord%20Bot-TypeScript-5865F2?style=flat-square&logo=discord" alt="Discord" /></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=nodedotjs" alt="Node.js" /></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs" alt="Next.js" /></a>
    <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-Package%20Manager-000000?style=flat-square&logo=bun" alt="Bun" /></a>
  </p>
</div>

---

## 📌 Overview

**Pomora** is a productivity suite combining a Discord bot and modern web dashboard. Based on the Pomodoro technique, it helps developers and teams manage work sessions, track focus time, and maintain productivity metrics. Use the Discord bot for real-time notifications or the web dashboard for detailed analytics.

---

## ✨ Key Features

- **⏱️ Pomodoro Sessions**: Timer-based work/break cycles with Discord notifications
- **📊 Analytics Dashboard**: Visual productivity metrics and session history
- **🔔 Real-time Notifications**: Get pinged in Discord when sessions start/end
- **👥 Team Tracking**: Monitor team productivity and collaboration patterns
- **📈 Weekly Reports**: Auto-generated productivity summaries
- **🎯 Goal Setting**: Define and track focus goals
- **⚙️ Custom Intervals**: Adjustable work/break durations

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Discord Bot** | discord.js, TypeScript, Node.js |
| **Web Dashboard** | Next.js 15, React, TailwindCSS |
| **Database** | MongoDB |
| **Package Manager** | Bun 1.3.x |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or Bun 1.3.x
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))
- MongoDB connection string

### 1. Clone & Install
```bash
git clone https://github.com/sirrryasir/pomora.git
cd pomora
bun install
```

### 2. Configure Environment
Create a `.env.local` file:
```env
DISCORD_TOKEN=your_discord_bot_token
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pomora
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start Services

**Discord Bot:**
```bash
cd bot
bun run dev
```

**Web Dashboard:**
```bash
cd web
bun run dev
```

Access dashboard at `http://localhost:3000`

---

## 📁 Project Structure

```
pomora/
├── bot/             # Discord.js bot implementation
│   ├── src/
│   ├── commands/
│   └── events/
├── web/             # Next.js web dashboard
│   ├── app/
│   ├── components/
│   └── lib/
└── bun.lock
```

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

1. **Fork and clone**
   ```bash
   git clone https://github.com/sirrryasir/pomora.git
   cd pomora
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes and test**
   ```bash
   bun run dev
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

---

## 📄 License

MIT License. See `LICENSE` for details.

---

## 👨‍💻 Author

Built by **Yasir Hassan** ([@sirrryasir](https://github.com/sirrryasir))  
Portfolio: [yaasir.dev](https://www.yaasir.dev)

---

**Give it a star if you find it useful!** ⭐
