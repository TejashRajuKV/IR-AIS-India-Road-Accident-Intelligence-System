"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
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

  const currentTab = searchParams.get("tab") || "dashboard";

  const handleNav = (link: (typeof navLinks)[0]) => {
    router.push(link.href);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground leading-none">
              IR-AIS
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
              Road Accident Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.hash === currentTab;
            return (
              <button
                key={link.hash}
                onClick={() => handleNav(link)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
                )}
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = link.hash === currentTab;
              return (
                <button
                  key={link.hash}
                  onClick={() => handleNav(link)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
