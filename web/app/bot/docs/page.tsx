"use client";

import Link from "next/link";
import { Copy, Check, ChevronRight, Hash, Github, Menu, X, Plus, Terminal, Settings, Trophy, Clock, Bell, Info, Shield, Zap } from "lucide-react";
import { CodeTabs } from "../../../components/docs/CodeTabs";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { BotNavbar } from "../../../components/bot/BotNavbar";
import { BotFooter } from "../../../components/bot/BotFooter";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function DocsPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("introduction");

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-10% 0px -80% 0px" });

        const sections = document.querySelectorAll("section[id]");
        sections.forEach((section) => observer.observe(section));

        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);

    return (
        <div className="flex flex-col min-h-screen relative selection:bg-orange-500/30 font-sans">
            <BotNavbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMenuOpen={isMobileMenuOpen} suffix="Bot Docs" />

            <div className="container mx-auto px-4 sm:px-6 flex-1 flex relative">
                {/* Desktop Sidebar - Added shrink-0 for stability */}
                <aside className="w-64 py-12 hidden md:block border-r border-border sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar shrink-0">
                    <DocsNav activeSection={activeSection} />
                </aside>

                {/* Content Area */}
                <main className="flex-1 py-12 md:pl-12 max-w-4xl min-w-0">
                    <div className="space-y-24">
                        {/* Introduction */}
                        <section id="introduction" className="scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-center gap-2 text-orange-500 font-bold mb-4 bg-orange-500/5 w-fit px-4 py-1.5 rounded-full border border-orange-500/10">
                                    <Zap className="w-4 h-4" />
                                    <span className="text-[10px] uppercase tracking-widest font-black">Version 1.2 Now Live</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-none">
                                    BRING FOCUS TO<br />
                                    <span className="text-orange-500">YOUR COMMUNITY.</span>
                                </h1>
                                <p className="text-muted-foreground text-xl leading-relaxed font-light max-w-2xl">
                                    Pomora is the first <span className="text-foreground font-semibold">Zero-Command</span> Pomodoro bot.
                                    By automating the entire focus-break cycle through voice channel detection, we help study communities stay
                                    productive without the friction of complex bot commands.
                                </p>
                            </motion.div>
                        </section>

                        {/* Installation */}
                        <section id="getting-started" className="scroll-mt-24">
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Plus className="w-4 h-4 text-orange-500" />
                                    </div>
                                    Installation
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-6 text-foreground">
                                    <div className="p-8 rounded-[2rem] bg-muted/20 border border-border group hover:border-orange-500/30 transition-all">
                                        <h3 className="font-bold text-xl mb-4">1. Invite the Bot</h3>
                                        <p className="text-muted-foreground mb-6 text-sm leading-relaxed font-light">Click the button below to authorize Pomora on your server. No credit card required.</p>
                                        <Link
                                            href="https://discord.com/api/oauth2/authorize?client_id=1467251658718445758&permissions=8&scope=bot%20applications.commands"
                                            target="_blank"
                                        >
                                            <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                                                Add to Discord
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="p-8 rounded-[2rem] bg-muted/20 border border-border group hover:border-orange-500/30 transition-all">
                                        <h3 className="font-bold text-xl mb-4">2. Check Permissions</h3>
                                        <p className="text-muted-foreground mb-4 text-sm leading-relaxed font-light">Ensure Pomora has the following permissions in your study channels:</p>
                                        <ul className="space-y-2">
                                            {['View Channel', 'Connect', 'Speak', 'Embed Links'].map((p) => (
                                                <li key={p} className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                                    <Check className="w-4 h-4 text-emerald-500" /> {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Automated Flow */}
                        <section id="automated-flow" className="scroll-mt-24">
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                    </div>
                                    Zero-Command Automation
                                </h2>
                                <p className="text-muted-foreground text-lg max-w-2xl font-light leading-relaxed">
                                    Unlike other bots that require a prefix to start, Pomora is entirely event-driven.
                                    Here is how the magic happens:
                                </p>

                                <div className="space-y-12 pt-4">
                                    {[
                                        { step: '01', title: 'Activation Trigger', desc: 'When the first person joins a configured Voice Channel, Pomora automatically joins and initiates the focus timer.' },
                                        { step: '02', title: 'Smart Intervals', desc: 'The bot cycles through 25m Focus and 5m Break periods. It plays a subtle chime and announces the transition via voice.' },
                                        { step: '03', title: 'Visual Evidence', desc: 'Every minute, the bot updates a beautiful "Status Card" in the corresponding text channel so the whole community can see development.' },
                                        { step: '04', title: 'Session End', desc: 'Once the VC is empty for more than 5 minutes, Pomora gracefully leaves and saves the session data for the daily report.' },
                                    ].map((s) => (
                                        <div key={s.step} className="flex gap-8 group">
                                            <div className="text-5xl font-black text-foreground/5 group-hover:text-orange-500/20 transition-colors duration-500 leading-none shrink-0">{s.step}</div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors duration-300">{s.title}</h3>
                                                <p className="text-muted-foreground leading-relaxed font-light text-sm">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Admin Setup */}
                        <section id="admin-setup" className="scroll-mt-24 space-y-8">
                            <div className="pt-8">
                                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Settings className="w-4 h-4 text-orange-500" />
                                    </div>
                                    The `!setup` Command
                                </h2>
                                <p className="text-muted-foreground mb-8 text-lg font-light leading-relaxed">
                                    Configure Pomora for your specific server needs. Use the command below to open the interactive setup menu.
                                </p>

                                <div className="grid gap-12">
                                    <div className="p-8 rounded-[3rem] bg-orange-500/5 border border-orange-500/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                                            <Settings className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10 space-y-8">
                                            <div>
                                                <h3 className="text-2xl font-black mb-4 flex items-center gap-2 italic tracking-tighter">
                                                    <Terminal className="w-6 h-6 text-orange-500" />
                                                    Configuration Menu
                                                </h3>
                                                <p className="text-muted-foreground mb-6 font-light text-sm max-w-lg leading-relaxed">
                                                    Open a private admin-only view to configure report channels and voice channel monitoring without cluttering your chat.
                                                </p>
                                                <CodeBlock code="!setup" />
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-orange-500/10">
                                                <div className="space-y-2">
                                                    <h4 className="font-bold flex items-center gap-2 text-sm tracking-tight">
                                                        <Hash className="w-4 h-4 text-orange-500" />
                                                        Report Channel
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground font-light leading-normal">Select where Pomora posts daily, weekly, and monthly productivity PDFs and images.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-bold flex items-center gap-2 text-sm tracking-tight">
                                                        <Clock className="w-4 h-4 text-orange-500" />
                                                        Custom Intervals
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground font-light leading-normal">Set default focus/break lengths for the entire server (e.g. 50/10 or 25/5).</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Command Reference */}
                        <section id="commands" className="scroll-mt-24 space-y-8">
                            <div className="pt-8 text-foreground">
                                <h2 className="text-3xl font-black mb-10 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Hash className="w-4 h-4 text-orange-500" />
                                    </div>
                                    Complete Commands
                                </h2>

                                <div className="rounded-[2.5rem] border border-border overflow-hidden bg-muted/10">
                                    <div className="overflow-x-auto selection:bg-orange-500/20">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead className="bg-muted uppercase text-[10px] font-black tracking-widest text-muted-foreground border-b border-border">
                                                <tr>
                                                    <th className="px-8 py-6">Command</th>
                                                    <th className="px-8 py-6">Description</th>
                                                    <th className="px-8 py-6">Access</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {[
                                                    { cmd: '!leaderboard', desc: 'Shows the top 10 most productive students of the week.', role: 'Public' },
                                                    { cmd: '!status', desc: 'Re-posts the current room status card manually.', role: 'Public' },
                                                    { cmd: '!me', desc: 'View your personal focus statistics and global rank.', role: 'Public' },
                                                    { cmd: '!setup', desc: 'Initialize server configuration and monitoring.', role: 'Admin' },
                                                    { cmd: '!test-report', desc: 'Generate a mock daily report to verify channels.', role: 'Admin' },
                                                ].map((row) => (
                                                    <tr key={row.cmd} className="hover:bg-orange-500/[0.02] transition-colors group">
                                                        <td className="px-8 py-6 font-black text-orange-500 font-mono tracking-tighter whitespace-nowrap">{row.cmd}</td>
                                                        <td className="px-8 py-6 text-muted-foreground font-light leading-relaxed">{row.desc}</td>
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                                                                row.role === 'Admin' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : "bg-muted border-border text-muted-foreground"
                                                            )}>
                                                                {row.role}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* FAQ */}
                        <section id="faq" className="scroll-mt-24 space-y-12 pb-24">
                            <div className="pt-8">
                                <h2 className="text-3xl font-black mb-12 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Info className="w-4 h-4 text-orange-500" />
                                    </div>
                                    FAQ
                                </h2>
                                <div className="grid gap-6">
                                    {[
                                        { q: "Is Pomora really free?", a: "The core bot is completely free. We offer a Premium tier for servers that want custom status card branding and advanced CSV session exports." },
                                        { q: "How many Study Rooms can it monitor?", a: "By default, Pomora monitors up to 5 voice channels per server. You can configure which specific channels it watches via !setup." },
                                        { q: "Can I use my own sounds?", a: "Not yet! We have a curated list of high-fidelity focus chimes, but custom user sounds are coming in the Q1 2026 update." },
                                    ].map((item, i) => (
                                        <div key={i} className="p-8 rounded-[2rem] border border-border bg-muted/10 hover:border-orange-500/30 transition-all group">
                                            <h4 className="font-black text-xl mb-4 group-hover:text-orange-500 transition-colors leading-tight tracking-tight">{item.q}</h4>
                                            <p className="text-muted-foreground font-light leading-relaxed text-sm">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                {/* Desktop On-this-page Sidebar - Also added shrink-0 */}
                <aside className="hidden lg:block w-56 py-12 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pl-8 no-scrollbar shrink-0">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-6 italic opacity-80">On this page</p>
                    <ul className="space-y-4 text-sm border-l-2 border-border/50 pl-4">
                        {[
                            { id: "introduction", label: "Introduction" },
                            { id: "getting-started", label: "Installation" },
                            { id: "automated-flow", label: "Auto Flow" },
                            { id: "admin-setup", label: "Admin Setup" },
                            { id: "commands", label: "Commands" },
                            { id: "faq", label: "FAQ" }
                        ].map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className={cn(
                                        "transition-all duration-300 block py-0.5 font-bold tracking-tight origin-left",
                                        activeSection === item.id
                                            ? "text-orange-500 translate-x-1 scale-105"
                                            : "text-muted-foreground hover:text-foreground hover:translate-x-0.5"
                                    )}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>

            {/* Footer added back at the bottom of the entire page */}
            <BotFooter />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-xl"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            className="fixed left-0 top-16 bottom-0 z-50 w-3/4 max-w-xs bg-background/95 backdrop-blur-2xl border-r border-border p-6 overflow-y-auto no-scrollbar"
                        >
                            <DocsNav activeSection={activeSection} onClick={() => setIsMobileMenuOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function DocsNav({ onClick, activeSection }: { onClick?: () => void, activeSection?: string }) {
    const linkClass = (id: string) => cn(
        "block py-2 transition-all border-l-2 pl-4 -ml-px text-sm font-bold tracking-tight origin-left",
        activeSection === id
            ? "border-orange-500 text-orange-500 bg-orange-500/5 rounded-r-xl scale-[1.02]"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-orange-500/20 hover:scale-[1.01]"
    );

    return (
        <nav className="space-y-12 pl-2">
            <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-4">Getting Started</p>
                <ul className="space-y-2">
                    <li><a href="#introduction" onClick={onClick} className={linkClass("introduction")}>Introduction</a></li>
                    <li><a href="#getting-started" onClick={onClick} className={linkClass("getting-started")}>Installation</a></li>
                    <li><a href="#automated-flow" onClick={onClick} className={linkClass("automated-flow")}>Auto Flow</a></li>
                </ul>
            </div>
            <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-4">Implementation</p>
                <ul className="space-y-2">
                    <li><a href="#admin-setup" onClick={onClick} className={linkClass("admin-setup")}>Admin Setup</a></li>
                    <li><a href="#commands" onClick={onClick} className={linkClass("commands")}>Command List</a></li>
                </ul>
            </div>
            <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-4">Support</p>
                <ul className="space-y-2">
                    <li><a href="#faq" onClick={onClick} className={linkClass("faq")}>FAQ</a></li>
                    <li><Link href="/bot" onClick={onClick} className="block py-2 border-l-2 border-transparent pl-4 -ml-px text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 font-bold transition-all">
                        <ChevronRight className="w-3 h-3 text-orange-500" />
                        Back to Home
                    </Link></li>
                    <li><a href="https://discord.com/api/oauth2/authorize?client_id=1467251658718445758&permissions=8&scope=bot%20applications.commands" target="_blank" className="block py-2 border-l-2 border-transparent pl-4 -ml-px text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 font-bold transition-all">
                        <Plus className="w-3 h-3 text-emerald-500" />
                        Invite Bot
                    </a></li>
                </ul>
            </div>
        </nav>
    );
}

function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="relative group">
            <pre className="bg-zinc-950 border border-white/5 rounded-2xl p-6 pr-14 font-mono text-sm text-zinc-300 overflow-x-auto selection:bg-orange-500/30 shadow-2xl no-scrollbar">
                <code className="text-orange-500 underline underline-offset-4 decoration-orange-500/20">{code}</code>
            </pre>
            <button
                onClick={onCopy}
                className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow-xl"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    )
}
