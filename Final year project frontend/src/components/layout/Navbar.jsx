import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Cpu,
  Layers,
  FileText,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useHealth } from "../../hooks/useHealth";
import { cn } from "../../lib/utils";

export const Navbar = () => {
  const location = useLocation();
  const { health, loading, isJavaOnline, isMlOnline, refetch } = useHealth(20000);

  const navLinks = [
    { label: "Dashboard", href: "/", icon: <Layers className="w-4 h-4" /> },
    { label: "Documents", href: "/documents", icon: <FileText className="w-4 h-4" /> },
    { label: "System Health", href: "/health", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Project Title */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg p-1"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-950/50 border border-cyan-400/30 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-100 text-base tracking-tight group-hover:text-cyan-300 transition-colors">
                  Multimodal Blueprint & Circuit RAG
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Tesseract OCR & YOLO Vision Pipeline
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Service Connectivity Badges */}
          <div className="flex items-center gap-2">
            {/* Java Backend Status */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-colors",
                isJavaOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              )}
              title={
                isJavaOnline
                  ? `Java Backend: ${health?.status} (${health?.applicationName || "Spring Boot"})`
                  : "Java Backend Unreachable at http://localhost:8080"
              }
            >
              <Server className="w-3.5 h-3.5 shrink-0" />
              <span>Java:</span>
              {isJavaOnline ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> UP
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-400" /> Offline
                </span>
              )}
            </div>

            {/* Python ML Pipeline Status */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-colors",
                !isJavaOnline
                  ? "bg-slate-800 text-slate-500 border-slate-700"
                  : isMlOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              )}
              title={
                !isJavaOnline
                  ? "Java backend offline; ML status unknown"
                  : isMlOnline
                  ? `Python ML Service Reachable at ${health?.mlServiceUrl || "127.0.0.1:8000"}`
                  : `Python ML Service Offline (${health?.mlServiceUrl || "127.0.0.1:8000"})`
              }
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">ML Vision:</span>
              {!isJavaOnline ? (
                <span>Unknown</span>
              ) : isMlOnline ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>

            {/* Quick Refresh Status Button */}
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="Refresh Service Status"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-cyan-400")} />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden py-2 border-t border-slate-900 gap-1 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-slate-800 text-cyan-400 border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
