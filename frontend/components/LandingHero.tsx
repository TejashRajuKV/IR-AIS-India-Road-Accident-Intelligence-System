"use client";

import React from "react";
import Image from "next/image";
import { Activity, ArrowRight, MousePointerClick } from "lucide-react";
import { ScrollPathway } from "./PathwayLine";

export function LandingHero() {
  const scrollToContent = () => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-[#FFFaf5]">
      {/* Narrative Pathway Line */}
      <ScrollPathway className="opacity-40" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="fp-sticker mb-8 animate-fade-in-up">
            <Activity className="h-3 w-3 text-primary" />
            <span>National Traffic Intelligence Bureau</span>
          </div>

          <h1 className="editorial-title text-7xl md:text-9xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Predicting the <br />
            <span className="text-primary italic">Unpredictable</span>.
          </h1>

          <p className="text-xl md:text-2xl text-black/60 font-medium mb-12 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            A sophisticated machine learning engine deciphering 12,316 accident records to build a safer, more intelligent road network for India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={scrollToContent}
              className="fp-button fp-button-primary scale-110 !px-8 !py-4"
            >
              Enter Dashboard
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-black/40">
              <MousePointerClick className="h-4 w-4" />
              <span>Scroll to explore</span>
            </div>
          </div>
        </div>

        {/* Large Central Illustration */}
        <div className="mt-20 relative w-full h-[400px] md:h-[600px] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFaf5] via-transparent to-transparent z-10" />
          <Image
            src="/hero-illustration.png"
            alt="Etched illustration of an Indian highway system"
            fill
            className="object-contain object-center opacity-80"
            priority
          />
        </div>
      </div>
    </section>
  );
}
