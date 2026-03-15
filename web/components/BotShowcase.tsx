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
import { LiveUIShowcase } from './bot/LiveUIShowcase';

export function BotShowcase() {

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
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/5 border border-orange-500/10 mb-8 backdrop-blur-sm"
                    >
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500/80">Premium Focus Infrastructure</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tight mb-8 leading-[0.8] text-foreground">
                        FOCUS TOGETHER.<br />
                        <span className="text-orange-500">AUTOMATED.</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-foreground/60 mb-12 font-medium leading-relaxed">
                        Pomora is the world&apos;s first <span className="text-foreground border-b-2 border-orange-500/20">Voice-Automated</span> Pomodoro bot.
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
                    className="max-w-6xl mx-auto mt-20 pt-20 border-t border-foreground/5"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 mb-10">Integration Partners & Communities</p>
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        {['Ardaykaab Academy', 'TechTalk', 'Open Source Community'].map((name) => (
                            <div key={name} className="font-black text-2xl tracking-tighter italic select-none cursor-default">{name}</div>
                        ))}
                    </div>
                </motion.div>

                {/* High-Fidelity Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                    <motion.div
                        animate={{
                            opacity: [0.03, 0.08, 0.03],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-orange-500/20 blur-[160px] rounded-full"
                    />
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.05)_0%,transparent_70%)]" />
            </section>

            {/* Stats Grid */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground/5 rounded-3xl overflow-hidden border border-foreground/5">
                    {[
                        { label: 'Deep Work Sessions', value: 'Unlimited', icon: Timer },
                        { label: 'Community Focus', value: 'Active', icon: MessageSquare },
                        { label: 'Status Updates', value: 'Real-Time', icon: Clock },
                        { label: 'Uptime Reliability', value: '99.9%', icon: Shield },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-background p-10 flex flex-col items-center text-center group hover:bg-orange-500/5 transition-colors duration-500 relative overflow-hidden"
                        >
                            <stat.icon className="w-6 h-6 mb-6 text-foreground/20 group-hover:text-orange-500 transition-all duration-500" />
                            <div className="text-4xl font-black tracking-tight mb-2 group-hover:text-orange-500 transition-colors duration-500">{stat.value}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* High-Fidelity Showcase Section */}
            <section className="py-32 px-4 relative">
                <div className="max-w-6xl mx-auto flex flex-col items-center gap-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-4"
                    >
                        <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-[0.9]">
                            REAL-TIME.<br />
                            <span className="text-orange-500 underline decoration-orange-500/20 underline-offset-8">VISUAL SYNC.</span>
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto text-lg font-medium">
                            Experience the exact status cards generated inside your Discord channels.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="w-full max-w-5xl"
                    >
                        <LiveUIShowcase />
                    </motion.div>
                </div>
            </section>

            <BotFooter />
        </div>
    );
}
