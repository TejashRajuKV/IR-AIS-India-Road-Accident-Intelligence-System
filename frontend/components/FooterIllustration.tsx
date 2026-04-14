"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function FooterIllustration() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-[300px] md:h-80 overflow-hidden bg-[#FFFaf5] border-t-2 border-black/5 mt-20"
    >
      {/* Background Landscape */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/footer-landscape.png"
          alt="Etched landscape with a road to the horizon"
          fill
          className="object-cover object-center opacity-80"
        />
      </div>

      {/* Floating animated hot-air balloon */}
      <motion.div
        animate={{
          y: [0, -18, 0],
          x: [0, 10, 0],
          rotate: [0, 1.5, -1.5, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[52%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-20 md:w-16 md:h-24 pointer-events-none"
      >
        <div className="relative w-full h-full text-[#e05a47]">
          <svg
            viewBox="0 0 100 150"
            className="w-full h-full filter drop-shadow-[6px_6px_0px_rgba(0,0,0,0.8)]"
          >
            <path
              d="M50 5 C25 5 5 25 5 55 C5 95 50 125 50 125 C50 125 95 95 95 55 C95 25 75 5 50 5 Z"
              fill="currentColor"
              stroke="black"
              strokeWidth="3"
            />
            <rect x="40" y="125" width="20" height="15" fill="white" stroke="black" strokeWidth="3" />
            <line x1="5" y1="55" x2="40" y2="125" stroke="black" strokeWidth="2" />
            <line x1="95" y1="55" x2="60" y2="125" stroke="black" strokeWidth="2" />
          </svg>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFFaf5] to-transparent z-20" />
    </motion.section>
  );
}
