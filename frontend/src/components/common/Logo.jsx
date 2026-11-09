import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

/**
 * Premium Vector Brand Logo for Multimodal Blueprint & Circuit RAG
 * Features circuit traces, microprocessor core, optical target reticle, and blueprint accents.
 */
export const LogoIcon = ({ className = "w-10 h-10", size = 40 }) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-indigo-500/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* SVG Circuit & Blueprint Glyph */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]"
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Circuit Trace Neon Gradient */}
          <linearGradient id="neonTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>

          {/* Chip Core Gradient */}
          <linearGradient id="chipCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Rounded Shield */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#logoBgGrad)"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />

        {/* Blueprint Grid Coordinates Dots */}
        <circle cx="8" cy="8" r="1" fill="#38bdf8" fillOpacity="0.5" />
        <circle cx="40" cy="8" r="1" fill="#38bdf8" fillOpacity="0.5" />
        <circle cx="8" cy="40" r="1" fill="#38bdf8" fillOpacity="0.5" />
        <circle cx="40" cy="40" r="1" fill="#38bdf8" fillOpacity="0.5" />

        {/* Microchip Center Base */}
        <rect
          x="12"
          y="12"
          width="24"
          height="24"
          rx="6"
          fill="url(#chipCore)"
          stroke="#0284c7"
          strokeWidth="1.2"
        />

        {/* Vision Reticle / Corner Brackets (YOLO detection motif) */}
        <path
          d="M 14 18 L 14 14 L 18 14"
          stroke="#22d3ee"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 30 14 L 34 14 L 34 18"
          stroke="#22d3ee"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 14 30 L 14 34 L 18 34"
          stroke="#22d3ee"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 34 30 L 34 34 L 30 34"
          stroke="#22d3ee"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Microcontroller Circuit Core (Diamond / Node) */}
        <rect
          x="19"
          y="19"
          width="10"
          height="10"
          rx="2"
          fill="#06b6d4"
          fillOpacity="0.25"
          stroke="#38bdf8"
          strokeWidth="1"
        />

        {/* Central Neural / Laser Focal Point */}
        <circle cx="24" cy="24" r="2.2" fill="#67e8f9" filter="url(#cyanGlow)" />

        {/* Circuit Bus Pin Leads (Top, Bottom, Left, Right) */}
        {/* Top Pins */}
        <line x1="20" y1="6" x2="20" y2="12" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="28" y1="6" x2="28" y2="12" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="20" cy="6" r="1.2" fill="#22d3ee" />
        <circle cx="28" cy="6" r="1.2" fill="#22d3ee" />

        {/* Bottom Pins */}
        <line x1="20" y1="36" x2="20" y2="42" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="28" y1="36" x2="28" y2="42" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="20" cy="42" r="1.2" fill="#22d3ee" />
        <circle cx="28" cy="42" r="1.2" fill="#22d3ee" />

        {/* Left Pins */}
        <line x1="6" y1="20" x2="12" y2="20" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="28" x2="12" y2="28" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="6" cy="20" r="1.2" fill="#22d3ee" />
        <circle cx="6" cy="28" r="1.2" fill="#22d3ee" />

        {/* Right Pins */}
        <line x1="36" y1="20" x2="42" y2="20" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="36" y1="28" x2="42" y2="28" stroke="url(#neonTrace)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="42" cy="20" r="1.2" fill="#22d3ee" />
        <circle cx="42" cy="28" r="1.2" fill="#22d3ee" />
      </svg>

      {/* Online indicator live dot */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center z-20">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
      </div>
    </div>
  );
};

export const BrandLogo = ({
  size = 40,
  showSubtitle = true,
  className = "",
  compactOnMobile = true,
}) => {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-xl p-1 transition-all",
        className
      )}
    >
      <LogoIcon size={size} />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-100 text-sm sm:text-base tracking-tight group-hover:text-cyan-300 transition-colors truncate">
            {compactOnMobile ? (
              <>
                <span className="sm:hidden">Circuit RAG</span>
                <span className="hidden sm:inline">Multimodal Blueprint & Circuit RAG</span>
              </>
            ) : (
              "Multimodal Blueprint & Circuit RAG"
            )}
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold shrink-0">
            v1.0
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">
            Tesseract OCR & YOLO Vision Pipeline
          </p>
        )}
      </div>
    </Link>
  );
};

