"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ShieldAlert, BarChart3, BrainCircuit, Zap } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

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
  const [hidden, setHidden] = useState(false);

  const currentTab = searchParams.get("tab") || "dashboard";
  const { scrollY, scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on scroll-down, reveal on scroll-up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 120) {
      setHidden(true);
      setMobileOpen(false);
    } else {
      setHidden(false);
    }
  });

  const handleNav = (link: (typeof navLinks)[0]) => {
    router.push(link.href);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Scroll progress bar (replaces static accent line) */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-primary/20">
        <motion.div
          className="h-full bg-primary origin-left"
          style={{
            scaleX: scrollYProgress,
            boxShadow: "0 0 10px rgba(107,196,179,0.5)",
          }}
        />
      </div>

      {/* Animated header — slides up on scroll-down, back on scroll-up */}
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "sticky top-[3px] z-50 w-full",
          scrolled
            ? "bg-background/95 backdrop-blur-sm border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            : "bg-background border-b border-black/10"
        )}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => handleNav(navLinks[0])}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-primary border-2 border-black shadow-[3px_3px_0px_0px_rgba(107,196,179,1)]"
            >
              <ShieldAlert className="h-6 w-6" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-serif font-bold tracking-tight text-foreground leading-none">
                IR-AIS
              </span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground leading-none mt-1 hidden sm:block">
                Intelligence System
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => {
              const isActive = link.hash === currentTab;
              return (
                <button
                  key={link.hash}
                  onClick={() => handleNav(link)}
                  className={cn(
                    "tab-pill flex items-center gap-2 font-sans",
                    isActive ? "tab-pill-active" : "tab-pill-inactive"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {isActive && <span className="ml-1">→</span>}
                </button>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden border-2 border-black rounded-full h-10 w-10 bg-secondary/50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <motion.span
              animate={{ rotate: mobileOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.span>
          </Button>
        </div>
      </motion.header>

      {/* Mobile Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mobileOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-20 left-4 right-4 z-40 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div className="bg-card border-2 border-black rounded-2xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => {
              const isActive = link.hash === currentTab;
              return (
                <motion.button
                  key={link.hash}
                  onClick={() => handleNav(link)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={mobileOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold border-2 transition-all duration-200",
                    isActive
                      ? "bg-primary border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
                      : "bg-background border-transparent text-muted-foreground hover:border-black/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 border-black transition-colors",
                      isActive ? "bg-white" : "bg-secondary"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                  </div>
                  {link.label}
                  {isActive && (
                    <span className="ml-auto text-lg leading-none">→</span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </>
  );
}
