"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ShieldAlert, BarChart3, BrainCircuit, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/?tab=dashboard", label: "Dashboard", hash: "dashboard", icon: BarChart3 },
  { href: "/?tab=models", label: "Model Playground", hash: "models", icon: BrainCircuit },
  { href: "/?tab=predictor", label: "Live Predictor", hash: "predictor", icon: Zap },
];

export function Navbar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentTab = searchParams.get("tab") || "dashboard";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (link: (typeof navLinks)[0]) => {
    router.push(link.href);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top gradient accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <header className={cn(
        "sticky top-[2px] z-50 w-full transition-all duration-300",
        scrolled
          ? "glass-strong shadow-lg shadow-black/10"
          : "bg-background/60 backdrop-blur-md border-b border-border/30"
      )}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button onClick={() => handleNav(navLinks[0])} className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-all duration-300 animate-pulse-glow">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                  IR-AIS
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
                Road Accident Intelligence
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-muted/30">
            {navLinks.map((link) => {
              const isActive = link.hash === currentTab;
              return (
                <button
                  key={link.hash}
                  onClick={() => handleNav(link)}
                  className={cn(
                    "tab-pill flex items-center gap-1.5",
                    isActive && "active"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Mobile Menu */}
      <div className={cn(
        "fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300 overflow-hidden",
        mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="glass-strong border-b border-border/30 mx-4 mt-2 rounded-2xl p-3 shadow-xl shadow-black/20">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link, i) => {
              const isActive = link.hash === currentTab;
              return (
                <button
                  key={link.hash}
                  onClick={() => handleNav(link)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    isActive ? "bg-primary/20" : "bg-muted"
                  )}>
                    <link.icon className="h-4 w-4" />
                  </div>
                  {link.label}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
