'use client';

import { BotNavbar } from '@/components/bot/BotNavbar';
import { BotFooter } from '@/components/bot/BotFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Users,
    MessageSquare,
    Trophy,
    Shield,
    ChevronRight,
    Plus,
    BarChart3,
    Timer,
    BookOpen,
    Rocket,
    Clock,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TracingBeam } from './ui/TracingBeam';
import { useState, useEffect } from 'react';

export function BotShowcase() {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        setParticles([...Array(20)].map((_, i) => ({
            id: i,
            initialX: Math.random() * 100 + "%",
            initialY: Math.random() * 100 + "%",
            scale: Math.random() * 0.5 + 0.5,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 10,
            animateX: (Math.random() * 20 - 10) + "%"
        })));
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
            <BotNavbar suffix="Bot" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto text-center relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8"
                    >
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Trusted by 10,000+ Students</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70">
                        FOCUS TOGETHER.<br />
                        <span className="text-orange-500 bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">AUTOMATED.</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-foreground/60 mb-12 font-medium leading-relaxed">
                        Pomora is the world&apos;s first <span className="text-foreground border-b-2 border-orange-500/20">Zero-Command</span> Pomodoro bot.
                        Deep work, made simple.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="https://discord.com/api/oauth2/authorize?client_id=1467251658718445758&permissions=8&scope=bot%20applications.commands"
                            target="_blank"
                            className="w-full sm:w-auto relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <Button
                                size="lg"
                                className="relative bg-orange-500 hover:bg-orange-600 text-white px-10 py-8 rounded-2xl text-xl font-black uppercase tracking-wider group transition-all active:scale-95 w-full sm:w-auto overflow-hidden"
                            >
                                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
                                Add to Discord
                            </Button>
                        </Link>
                        <Link href="/bot/docs" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8 py-7 rounded-2xl text-lg font-black uppercase tracking-wider border-foreground/10 hover:bg-foreground/5 transition-all w-full sm:w-auto group"
                            >
                                <BookOpen className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                View Documentation
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto mt-20 pt-20 border-t border-foreground/[0.05]"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 mb-10">Integration Partners & Communities</p>
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        {['TechTalk', 'Ardaykaab Academy', 'University Hub', 'Developer Study', 'Medical Prep'].map((name) => (
                            <div key={name} className="font-black text-2xl tracking-tighter italic select-none cursor-default">{name}</div>
                        ))}
                    </div>
                </motion.div>

                {/* Decorative Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-500/10 blur-[120px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.05, 0.15, 0.05],
                            rotate: [0, -90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-orange-600/10 blur-[100px] rounded-full"
                    />

                    {/* Animated Particles */}
                    <div className="absolute inset-0">
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{
                                    opacity: 0,
                                    x: p.initialX,
                                    y: p.initialY,
                                    scale: p.scale
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: ["-10%", "110%"],
                                    x: p.animateX
                                }}
                                transition={{
                                    duration: p.duration,
                                    repeat: Infinity,
                                    delay: p.delay,
                                    ease: "linear"
                                }}
                                className="absolute w-1 h-1 bg-orange-500/20 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.05)_0%,transparent_70%)]" />
            </section>

            {/* Stats Grid */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Deep Work Sessions', value: '1.2M+', icon: Timer },
                        { label: 'Study Rooms Active', value: '850+', icon: MessageSquare },
                        { label: 'Focus Hours Logged', value: '4.8M', icon: Clock },
                        { label: 'Uptime Reliability', value: '99.9%', icon: Shield },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="bg-background/20 backdrop-blur-xl border-border/50 p-8 rounded-[2rem] flex flex-col items-center text-center group hover:bg-orange-500/5 hover:border-orange-500/20 transition-all duration-500 h-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <stat.icon className="w-8 h-8 mb-6 text-muted-foreground/30 group-hover:text-orange-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10" />
                                <div className="text-4xl font-black tracking-tighter mb-2 relative z-10 group-hover:text-orange-500 transition-colors duration-500">{stat.value}</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 relative z-10">{stat.label}</div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features Section with TracingBeam */}
            <section className="py-32 px-4 relative">
                <TracingBeam className="max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-20 items-center">
                        <div className="flex-1 space-y-12">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]"
                            >
                                VISUAL PROGRESS.<br />
                                <span className="text-orange-500 underline decoration-orange-500/20 underline-offset-8">REAL-TIME SYNC.</span>
                            </motion.h2>

                            <div className="space-y-8">
                                {[
                                    { title: 'Mandatory Setup Control', desc: 'Secure and precise. Admins explicitly designate study rooms to ensure tracking is 100% accurate and intentional.', icon: Zap },
                                    { title: 'Interactive Status Cards', desc: 'A dynamically updated, beautifully rendered image appears in your voice channel, showing exactly who is in deep focus.', icon: BarChart3 },
                                    { title: 'Persistent Timer Logic', desc: 'Focus sessions survive brief disconnects. Timers only pause or stop when the current stage completes, maintaining flow.', icon: Clock },
                                    { title: 'Real-Time Server Analytics', desc: 'No mock data. Get daily and weekly PDF summaries of your server\'s actual productivity performance.', icon: Trophy },
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex gap-6 group"
                                    >
                                        <div className="shrink-0 w-14 h-14 rounded-2xl bg-orange-500/5 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 border border-orange-500/10 group-hover:border-transparent shadow-lg shadow-orange-500/0 group-hover:shadow-orange-500/20">
                                            <feature.icon className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-xl group-hover:text-orange-500 transition-colors duration-300 tracking-tight">{feature.title}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm font-light">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="flex-1 w-full max-w-lg"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-rose-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                                <div className="relative bg-zinc-950 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                                    <img
                                        src="/images/bot-preview.png"
                                        alt="Bot Interface"
                                        className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-6 -right-6 bg-orange-500 text-white p-6 rounded-full shadow-2xl hidden md:block"
                                >
                                    <Trophy className="w-8 h-8" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </TracingBeam>
            </section>

            {/* Call to Action */}
            <section className="py-32 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Card className="max-w-4xl mx-auto bg-orange-500 p-12 md:p-20 rounded-[3rem] text-center border-none relative overflow-hidden group shadow-[0_30px_100px_-20px_rgba(249,115,22,0.6)]">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8">
                                Ready to boost your<br />server&apos;s productivity?
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="https://discord.com/api/oauth2/authorize?client_id=1467251658718445758&permissions=8&scope=bot%20applications.commands"
                                    target="_blank"
                                >
                                    <Button
                                        size="lg"
                                        className="bg-white text-orange-500 hover:bg-zinc-100 px-10 py-8 rounded-2xl text-xl font-black uppercase tracking-wider transition-all active:scale-95 group shadow-2xl"
                                    >
                                        Invite Pomora Now
                                    </Button>
                                </Link>
                                <Link href="/bot/docs" className="bg-transparent border-white/20 hover:bg-white/10 text-white px-12 py-8 rounded-2xl text-xl font-black uppercase tracking-wider transition-all active:scale-95 text-center">
                                    Read Docs
                                </Link>
                            </div>
                        </div>

                        {/* Decorative Background for CTA */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/20 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
                    </Card>
                </motion.div>
            </section>

            <BotFooter />
        </div>
    );
}
