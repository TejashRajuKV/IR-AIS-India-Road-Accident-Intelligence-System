"use client";

import React, { useRef } from "react";
import { useScroll, useSpring, motion, useTransform } from "framer-motion";
import { cn } from "@/frontend/lib/utils";

export function ScrollPathway({ className }: { className?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div ref={ref} className={cn("absolute inset-0 pointer-events-none z-0 overflow-visible", className)}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        className="overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M 50,0 Q 80,250 20,500 T 50,1000"
          style={{ pathLength: pathLength }}
          className="stroke-black stroke-[0.2] fill-none"
          strokeDasharray="1 2"
          strokeLinecap="round"
          filter="drop-shadow(0.5px 0.5px 0px rgba(107, 196, 179, 1))"
        />
      </svg>
    </div>
  );
}

// A more complex zig-zag path for the narrative section
export function NarrativeScrollPath({ className }: { className?: string }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start center", "end end"],
    });
  
    const pathLength = useSpring(scrollYProgress, {
      stiffness: 50,
      damping: 20,
    });
  
    return (
      <div ref={ref} className={cn("absolute inset-0 pointer-events-none z-0", className)}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 2000"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <motion.path
            d="M 50,0 C 50,200 10,300 10,500 S 90,700 90,1000 S 10,1300 10,1500 S 50,1700 50,2000"
            style={{ pathLength: pathLength }}
            stroke="#1a1a1a"
            strokeWidth="0.2"
            fill="none"
            strokeDasharray="1 2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

export function CustomPathway({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      className={cn("overflow-visible absolute inset-0 pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={d}
        className="path-line animate-draw-path"
      />
    </svg>
  );
}
