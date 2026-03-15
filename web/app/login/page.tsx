"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Timer, Github } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BotNavbar } from "@/components/bot/BotNavbar";
import { BotFooter } from "@/components/bot/BotFooter";
import Image from "next/image";

const Google = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const Discord = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 127.14 96.36" fill="currentColor" {...props}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14h0C127.86,52.43,122.1,28.71,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.3,46,96.19,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/timer";
  const error = searchParams.get("error");

  const providers = [
    {
      name: "Google",
      id: "google",
      icon: Google,
      color: "bg-red-500 hover:bg-red-600 text-white",
    },
    {
      name: "GitHub",
      id: "github",
      icon: Github,
      color: "bg-neutral-800 hover:bg-neutral-900 text-white",
    },
    {
      name: "Discord",
      id: "discord",
      icon: Discord,
      color: "bg-indigo-500 hover:bg-indigo-600 text-white",
    },
  ];

  return (
    <>
      <BotNavbar suffix="Timer" />
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-[2.5rem] bg-muted/10 border border-border/50 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Timer className="w-32 h-32" />
          </div>

          <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
            <Image
              src="/images/logo.png"
              alt="Pomora Logo"
              width={24}
              height={24}
              className="w-16 h-16"
            />
          </div>

          <h1 className="text-3xl font-black mb-2 tracking-tighter italic">
            Join the Hub
          </h1>
          <p className="text-muted-foreground mb-8 font-light">
            Sync your focus across web and Discord.
          </p>

          {error === "Configuration" && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              Network error contacting authentication servers. Please wait a
              moment and try again.
            </div>
          )}

          <div className="space-y-3 relative z-10">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className={`w-full py-6 rounded-2xl font-bold border-border/50 transition-all ${provider.color} hover:text-white`}
                onClick={() => signIn(provider.id, { callbackUrl })}
              >
                <provider.icon className="w-5 h-5 mr-3" />
                Continue with {provider.name}
              </Button>
            ))}
          </div>

          <div className="mt-8 text-xs text-muted-foreground font-light">
            By joining, you agree to our Terms of Service and Privacy Policy.
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 animate-pulse">
            <Timer className="w-4 h-4 text-orange-500" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
