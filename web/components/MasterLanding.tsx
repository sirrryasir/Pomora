"use client";

import { BotNavbar } from '@/components/bot/BotNavbar';
import { BotFooter } from '@/components/bot/BotFooter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Timer, MessageSquare, Zap, Clock, Shield, Trophy, ChevronRight, Rocket, Plus } from 'lucide-react';

export function MasterLanding() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
            <BotNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8"
                    >
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">The Ultimate Study Ecosystem</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70">
                        ONE SYSTEM.<br />
                        <span className="text-orange-500 bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ENDLESS FOCUS.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/60 mb-12 font-medium leading-relaxed">
                        Pomora unifies your productivity across the web and Discord.
                        Your focus, amplified.
                    </p>
                </div>

                {/* Animated Background Elements */}
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
                        className="absolute bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[100px] rounded-full"
                    />
                </div>
            </section>

            {/* Product Selection */}
            <section className="py-20 px-4 relative">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* Web App Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group relative p-8 rounded-[2.5rem] bg-muted/10 border border-border hover:border-orange-500/30 transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                            <Timer className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                                <Timer className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tighter italic">Web App</h3>
                            <p className="text-muted-foreground mb-8 font-light leading-relaxed">
                                A premium solo study environment with high-fidelity timers,
                                focus sounds, and persistent notes. No account required.
                            </p>
                            <div className="mt-auto">
                                <Link href="/timer">
                                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90 py-6 rounded-2xl font-black uppercase tracking-wider text-sm group">
                                        Open Web Timer
                                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Discord Bot Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group relative p-8 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10 hover:border-orange-500/30 transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                            <MessageSquare className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                                <MessageSquare className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tighter italic">Discord Bot</h3>
                            <p className="text-muted-foreground mb-8 font-light leading-relaxed">
                                Automate your study community with zero-command voice detection,
                                visual leaderboards, and daily reporting.
                            </p>
                            <div className="mt-auto space-y-4">
                                <Link href="/bot">
                                    <Button variant="outline" className="w-full border-orange-500/20 hover:bg-orange-500/5 py-6 rounded-2xl font-black uppercase tracking-wider text-sm text-orange-500">
                                        Bot Features
                                    </Button>
                                </Link>
                                <Link href="https://discord.com/api/oauth2/authorize?client_id=1467251658718445758&permissions=8&scope=bot%20applications.commands" target="_blank">
                                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-2xl font-black uppercase tracking-wider text-sm shadow-lg shadow-orange-500/20">
                                        Invite Now <Rocket className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Ecosystem Features */}
            <section className="py-20 px-4 bg-muted/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black tracking-tighter mb-4 italic">Unified Experience</h2>
                        <p className="text-muted-foreground font-light">Your focus data, synchronized across all platforms.</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-12">
                        {[
                            { icon: Clock, title: "Sync Data", desc: "Start a session on the web, see your total hours reflected in Discord." },
                            { icon: Shield, title: "Private & Safe", desc: "No data selling, no intrusive ads. Just pure productivity." },
                            { icon: Trophy, title: "Leaderboards", desc: "Compete with yourself or your community for the top spot." },
                        ].map((item, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-16 h-16 rounded-3xl bg-muted border border-border flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all duration-500">
                                    <item.icon className="w-8 h-8 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                                </div>
                                <h4 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h4>
                                <p className="text-sm text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <BotFooter />
        </div>
    );
}
