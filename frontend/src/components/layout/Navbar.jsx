import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  FileText,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { useHealth } from "../../hooks/useHealth";
import { cn } from "../../lib/utils";
import { BrandLogo } from "../common/Logo";

export const Navbar = () => {
  const location = useLocation();
  const { health, loading, isJavaOnline, isMlOnline, refetch } = useHealth(20000);

  const navLinks = [
    { label: "Dashboard", href: "/", icon: <Layers className="w-4 h-4" /> },
    { label: "Documents", href: "/documents", icon: <FileText className="w-4 h-4" /> },
    { label: "System Health", href: "/health", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo with Custom Circuit Icon */}
          <BrandLogo size={38} compactOnMobile={true} />

          {/* Desktop & Tablet Navigation Links */}
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
                    "flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/30"
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Java Backend Status Badge */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium border transition-colors",
                isJavaOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              )}
              title={
                isJavaOnline
                  ? `Java Backend: ${health?.status || "UP"} (${health?.applicationName || "Spring Boot"})`
                  : "Java Backend Unreachable at http://localhost:8080"
              }
            >
              <Server className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Java:</span>
              {isJavaOnline ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="hidden xs:inline">UP</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400">
                  <XCircle className="w-3 h-3" />
                  <span className="hidden xs:inline">Down</span>
                </span>
              )}
            </div>

            {/* Python ML Pipeline Status Badge */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium border transition-colors",
                !isJavaOnline
                  ? "bg-slate-800/80 text-slate-500 border-slate-700"
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
              <Cpu className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span className="hidden md:inline">ML Vision:</span>
              {!isJavaOnline ? (
                <span className="text-slate-500">?</span>
              ) : isMlOnline ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>Offline</span>
                </span>
              )}
            </div>

            {/* Quick Refresh Status Button */}
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="Refresh System Status"
              aria-label="Refresh System Status"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", loading && "animate-spin text-cyan-400")} />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (visible on screens below md) */}
        <div className="flex md:hidden py-2 border-t border-slate-900 gap-1.5 overflow-x-auto scrollbar-none">
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
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
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
