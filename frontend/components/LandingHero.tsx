"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Activity, ArrowRight, MousePointerClick } from "lucide-react";
import { ScrollPathway } from "./PathwayLine";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "./LenisProvider";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: illustration drifts downward (slower than scroll)
  const illustrationY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  // Hero text fades & rises as user scrolls away
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.65], [0, -44]);

  const { scrollTo } = useLenis();

  const scrollToContent = () => {
    const main = document.getElementById("main-content");
    if (main) {
      scrollTo(main);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-[#FFFaf5]"
    >
      <ScrollPathway className="opacity-40" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Text block with stagger + scroll-driven fade */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ opacity: textOpacity, y: textY }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="fp-sticker mb-8">
            <Activity className="h-3 w-3 text-primary" />
            <span>National Traffic Intelligence Bureau</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="editorial-title text-7xl md:text-9xl mb-8"
          >
            Predicting the <br />
            <span className="text-primary italic">Unpredictable</span>.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-black/60 font-medium mb-12 max-w-2xl leading-relaxed"
          >
            A sophisticated machine learning engine deciphering 12,316 accident
            records to build a safer, more intelligent road network for India.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6"
          >
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
          </motion.div>
        </motion.div>

        {/* Parallax illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          style={{ y: illustrationY }}
          className="mt-20 relative w-full h-[400px] md:h-[600px]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFaf5] via-transparent to-transparent z-10" />
          <Image
            src="/hero-illustration.png"
            alt="Etched illustration of an Indian highway system"
            fill
            className="object-contain object-center opacity-80"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
