"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { NarrativeScrollPath } from "./PathwayLine";

const sections = [
  {
    id: "data",
    title: "The Data Harvest",
    subtitle: "PHASE I",
    description: "Distilling meaning from 12,316 historical incident logs. We meticulously cleanse and structure the chaos of the road into high-fidelity intelligence.",
    image: "/data-cleansing.png",
    alignment: "left",
  },
  {
    id: "journey",
    title: "Decoding the Journey",
    subtitle: "PHASE II",
    description: "Every accident is a story of variables. We analyze the terrain, the light, and the human element to map every possible vector of risk.",
    image: "/the-journey.png",
    alignment: "right",
  },
  {
    id: "models",
    title: "The Intelligence Core",
    subtitle: "PHASE III",
    description: "Six specialized machine learning architectures work in tandem, predicting outcomes with 85%+ accuracy to foresee danger before it manifests.",
    image: "/hero-illustration.png",
    alignment: "left",
  },
  {
    id: "safety",
    title: "The Shield of Safety",
    subtitle: "PHASE IV",
    description: "Converting complex mathematics into real-time protection. A sanctuary of predictive safety for every citizen on the Indian road network.",
    image: "/safety-core.png",
    alignment: "right",
  },
];

export function NarrativeJourney() {
  return (
    <section className="relative py-32 bg-[#FFFaf5] overflow-hidden">
      {/* Continuous scroll-drawing path */}
      <NarrativeScrollPath className="h-full" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="space-y-[20vh] md:space-y-[30vh]">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`flex flex-col ${
                section.alignment === "right" ? "md:flex-row-reverse" : "md:flex-row"
              } items-center gap-12 md:gap-24`}
            >
              {/* Text Area */}
              <motion.div
                initial={{ opacity: 0, x: section.alignment === "left" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-6"
              >
                <div className="fp-sticker bg-white border-black/20 text-black/40">
                  {section.subtitle}
                </div>
                <h3 className="editorial-title !text-5xl md:!text-7xl">
                  {section.title}
                </h3>
                <p className="text-xl text-black/50 font-medium leading-relaxed max-w-lg">
                  {section.description}
                </p>
              </motion.div>

              {/* Image Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="flex-1 w-full"
              >
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white group">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-contain p-8 opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
