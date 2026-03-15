"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export function LiveUIShowcase() {
  const [time, setTime] = useState(3000); // Always start at 50:00 on refresh
  const [presenceTime, setPresenceTime] = useState(0);

  const radius = 94; // Optimized size to match screenshot
  const circumference = 2 * Math.PI * radius;
  // Progress is time-based out of 3000 total (50m total)
  // Screenshot shows about 80% full at 40:00, so we mirror that logic
  const progressPercent = (3000 - time) / 3000;
  const progress = progressPercent * circumference;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 3000));
      setPresenceTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full aspect-square md:aspect-[2/1] bg-[#090909] rounded-[2.5rem] overflow-hidden flex items-center justify-center p-8 border border-white/5 shadow-2xl">
      <div className="w-full max-w-5xl flex flex-col items-center">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10 translate-x-2">
          <Timer className="w-6 h-6 text-orange-500 fill-orange-500/20" />
          <h2 className="text-2xl md:text-3xl font-black text-orange-500 tracking-tighter uppercase flex items-center gap-3">
            Study Room 1
          </h2>
        </div>

        <div className="w-full flex items-center justify-between px-16 gap-4">
          {/* Left Side: Presence - Representative Avatar */}
          <div className="flex items-center gap-5 w-1/3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-[3px] border-blue-500/40 overflow-hidden bg-zinc-800 p-[2px]">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
                  alt="Participant"
                  className="w-full h-full rounded-full object-cover grayscale-[0.2] contrast-[1.1]"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-100 font-black text-[10px] uppercase tracking-[0.2em] mb-0.5">Present</span>
              <span className="text-zinc-500 font-bold text-xs tabular-nums">
                {formatTime(presenceTime)}
              </span>
            </div>
          </div>

          {/* Right Side: Circular Timer - Clockwise Progression */}
          <div className="relative flex items-center justify-end w-2/3 pr-8">
             <div className="relative">
                {/* SVG flipped via scaleX(-1) and rotated to ensure clockwise filling from the top */}
                <svg 
                  className="w-56 h-56 md:w-[320px] md:h-[320px]"
                  style={{ transform: 'rotate(-90deg) scaleY(-1)' }}
                >
                  {/* Background Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    className="fill-none stroke-zinc-900/50"
                    strokeWidth="16"
                  />
                  {/* Progress Circle (Clockwise Filling) */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    className="fill-none stroke-orange-500"
                    strokeWidth="16"
                    strokeLinecap="round"
                    animate={{
                      strokeDashoffset: circumference - (((3000 - time) / 3000) * circumference)
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                    style={{
                      strokeDasharray: circumference,
                    }}
                  />
                  {/* Indicator Dot */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="6"
                    className="fill-white"
                    style={{
                      transformOrigin: "center",
                      // ScaleY(-1) flip means we need to adjust rotation direction for the dot
                      rotate: ((3000 - time) / 3000) * -360,
                      translateY: -radius,
                    }}
                  />
                </svg>

                {/* Timer Text Inside Circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
                  <span className="text-5xl md:text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                    {formatTime(time)}
                  </span>
                  <span className="text-[10px] md:text-xs font-black text-orange-500 uppercase tracking-[0.4em] mt-3">
                    Focus
                  </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Subtle Grain Overlays */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
