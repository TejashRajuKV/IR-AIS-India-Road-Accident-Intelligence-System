"use client";

import React from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function FloatingSafeRoadsCoin() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ scale, rotate }}
      className="fixed bottom-10 right-10 z-[100] hidden lg:flex flex-col items-center gap-2 pointer-events-none"
    >
      <div className="h-20 w-20 rounded-full bg-primary border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
        <ShieldCheck className="h-10 w-10 text-black" />
      </div>
      <div className="bg-black text-[10px] text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(107,196,179,1)]">
        Safe Paths
      </div>
    </motion.div>
  );
}
