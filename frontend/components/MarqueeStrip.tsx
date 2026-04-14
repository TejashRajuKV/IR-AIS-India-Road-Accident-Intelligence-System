"use client";

import React from "react";

const stats = [
  { value: "12,316", label: "Accident Records" },
  { value: "85%+", label: "Model Accuracy" },
  { value: "14+", label: "ML Models Trained" },
  { value: "31", label: "Risk Features Analysed" },
  { value: "3", label: "Severity Classes" },
  { value: "<1s", label: "Real-time Prediction" },
  { value: "6+", label: "ML Architectures" },
  { value: "India", label: "Road Network" },
];

function MarqueeItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-8 shrink-0">
      <span className="text-xl font-serif font-bold text-black">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 whitespace-nowrap">
        {label}
      </span>
      <div className="h-4 w-px bg-black/15 ml-4 shrink-0" />
    </div>
  );
}

export function MarqueeStrip() {
  return (
    <div className="w-full overflow-hidden border-y-2 border-black/8 bg-[#ebdec5]/40 py-5 relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FFFaf5] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FFFaf5] to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center"
        style={{ animation: "marquee 32s linear infinite" }}
      >
        {/* First copy */}
        {stats.map((stat, i) => (
          <MarqueeItem key={`a-${i}`} value={stat.value} label={stat.label} />
        ))}
        {/* Duplicate for seamless loop */}
        {stats.map((stat, i) => (
          <MarqueeItem key={`b-${i}`} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  );
}
