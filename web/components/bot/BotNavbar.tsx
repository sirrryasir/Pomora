"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Github, Menu, X, Rocket, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function BotNavbar({
    onMenuClick,
    isMenuOpen,
    suffix = "Bot",
    extra
}: {
    onMenuClick?: () => void,
    isMenuOpen?: boolean,
    suffix?: string,
    extra?: React.ReactNode
}) {
    const [isInternalMenuOpen, setIsInternalMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const isOpen = isMenuOpen ?? isInternalMenuOpen;

    // Handle scroll state
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        // Initial check
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close internal menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsInternalMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className={`border-b sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? "border-border bg-background/80 backdrop-blur-md"
                : "border-transparent bg-background"
            }`}>
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={onMenuClick || (() => setIsInternalMenuOpen(!isInternalMenuOpen))}
                    >
                        {isOpen ? <X className="w-5 h-5 text-orange-500" /> : <Menu className="w-5 h-5 text-orange-500" />}
                    </button>

                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
                        <motion.div
                            whileHover={{ rotate: 15 }}
                            className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 transition-all"
                        >
                            <Image src="/images/logo.png" alt="Pomora Logo" width={24} height={24} className="w-6 h-6" />
                        </motion.div>
                        <span className="hidden sm:inline">Pom<span className="text-orange-500">ora</span></span>
                        {suffix && <span className="text-muted-foreground text-sm font-normal ml-2">{suffix}</span>}
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="text-muted-foreground hover:text-orange-500 transition-colors">Home</Link>
                    <Link href="/timer" className="text-muted-foreground hover:text-orange-500 transition-colors italic">Timer</Link>
                    <Link href="/bot" className="text-muted-foreground hover:text-orange-500 transition-colors">Bot</Link>
                    <Link href="/bot/docs" className="text-muted-foreground hover:text-orange-500 transition-colors">Docs</Link>
                    <div className="h-4 w-px bg-border mx-1" />

                    {extra && <div className="flex items-center gap-2 mr-2">{extra}</div>}

                    <a href="https://github.com/sirrryasir/Pomora" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Github className="w-5 h-5" />
                    </a>
                    <ThemeToggle />
                    <Link href="https://discord.com/api/oauth2/authorize?client_id=1467251658718445758&permissions=8&scope=bot%20applications.commands" target="_blank">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full h-9 px-5 shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2">
                            Invite <Rocket className="w-4 h-4" />
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Icons */}
                <div className="flex md:hidden items-center gap-2">
                    {extra}
                    <ThemeToggle />
                </div>
            </div>

            {/* Mobile Nav Overlay (Internal) */}
            <AnimatePresence>
                {!onMenuClick && isInternalMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl absolute w-full left-0 z-50 shadow-2xl"
                    >
                        <nav className="flex flex-col p-8 gap-2 text-sm font-medium">
                            <Link href="/" className="text-foreground hover:text-orange-500 transition-colors py-4 px-4 hover:bg-orange-500/5 rounded-xl flex items-center justify-between group" onClick={() => setIsInternalMenuOpen(false)}>
                                Home <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                            <Link href="/timer" className="text-foreground hover:text-orange-500 transition-colors py-4 px-4 hover:bg-orange-500/5 rounded-xl flex items-center justify-between group italic" onClick={() => setIsInternalMenuOpen(false)}>
                                Web Timer <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                            <Link href="/bot" className="text-foreground hover:text-orange-500 transition-colors py-4 px-4 hover:bg-orange-500/5 rounded-xl flex items-center justify-between group" onClick={() => setIsInternalMenuOpen(false)}>
                                Bot Showcase <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                            <Link href="/bot/docs" className="text-foreground hover:text-orange-500 transition-colors py-4 px-4 hover:bg-orange-500/5 rounded-xl flex items-center justify-between group" onClick={() => setIsInternalMenuOpen(false)}>
                                Documentation <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                            <Link
                                href="https://discord.com/api/oauth2/authorize?client_id=1467251658718445758&permissions=8&scope=bot%20applications.commands"
                                target="_blank"
                                className="bg-orange-500 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-wider mt-6 text-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                                onClick={() => setIsInternalMenuOpen(false)}
                            >
                                Invite Pomora Bot Now
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
