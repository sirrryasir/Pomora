"use client";

import Link from "next/link";
import Image from "next/image";

export function BotFooter() {
    return (
        <footer className="py-20 px-4 border-t border-border bg-muted/20 w-full mt-auto">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="space-y-4 text-center md:text-left">
                    <Link href="/" className="flex items-center justify-center md:justify-start gap-2 group">
                        <Image
                            src="/images/logo.png"
                            alt="Pomora"
                            width={32}
                            height={32}
                            className="w-8 h-8 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                        />
                        <span className="font-black tracking-tighter opacity-50 group-hover:opacity-100 transition-all uppercase text-lg">Pomora</span>
                    </Link>
                    <p className="text-xs text-muted-foreground/50 font-medium max-w-[200px] leading-relaxed">
                        A unified productivity ecosystem for solo study and global communities.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <div className="flex flex-col gap-3">
                        <span className="text-foreground/30 mb-1">Product</span>
                        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
                        <Link href="/timer" className="hover:text-orange-500 transition-colors italic">Web Timer</Link>
                        <Link href="/bot" className="hover:text-orange-500 transition-colors">Discord Bot</Link>
                        <Link href="/bot/docs" className="hover:text-orange-500 transition-colors">Documentation</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-foreground/30 mb-1">Community</span>
                        <a href="https://github.com/sirrryasir/pomora" target="_blank" className="hover:text-orange-500 transition-colors">GitHub</a>
                        <Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-orange-500 transition-colors">Terms</Link>
                    </div>
                </div>

                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 text-center md:text-right">
                    © {new Date().getFullYear()} Pomora
                    <br />
                    by <a href="https://yaasir.dev" target="_blank" className="text-orange-500/50 hover:text-orange-500 transition-colors underline decoration-orange-500/20 underline-offset-4">Yasir</a>
                </div>
            </div>
        </footer>
    );
}
