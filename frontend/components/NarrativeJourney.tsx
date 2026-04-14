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
    description:
      "Distilling meaning from 12,316 historical incident logs. We meticulously cleanse and structure the chaos of the road into high-fidelity intelligence.",
    image: "/data-cleansing.png",
    alignment: "left" as const,
  },
  {
    id: "journey",
    title: "Decoding the Journey",
    subtitle: "PHASE II",
    description:
      "Every accident is a story of variables. We analyze the terrain, the light, and the human element to map every possible vector of risk.",
    image: "/the-journey.png",
    alignment: "right" as const,
  },
  {
    id: "models",
    title: "The Intelligence Core",
    subtitle: "PHASE III",
    description:
      "Six specialized machine learning architectures work in tandem, predicting outcomes with 85%+ accuracy to foresee danger before it manifests.",
    image: "/hero-illustration.png",
    alignment: "left" as const,
  },
  {
    id: "safety",
    title: "The Shield of Safety",
    subtitle: "PHASE IV",
    description:
      "Converting complex mathematics into real-time protection. A sanctuary of predictive safety for every citizen on the Indian road network.",
    image: "/safety-core.png",
    alignment: "right" as const,
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const rowVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

const bodyVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

export function NarrativeJourney() {
  return (
    <section className="relative py-32 bg-[#FFFaf5] overflow-hidden">
      <NarrativeScrollPath className="h-full" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="space-y-[20vh] md:space-y-[30vh]">
          {sections.map((section) => (
            <motion.div
              key={section.id}
              variants={rowVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className={`flex flex-col ${
                section.alignment === "right"
                  ? "md:flex-row-reverse"
                  : "md:flex-row"
              } items-center gap-12 md:gap-24`}
            >
              {/* Text block — stagger: subtitle → title → body */}
              <motion.div
                variants={{
                  hidden: {
                    opacity: 0,
                    x: section.alignment === "left" ? -50 : 50,
                  },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      staggerChildren: 0.12,
                      delayChildren: 0.05,
                    },
                  },
                }}
                className="flex-1 space-y-6"
              >
                <motion.div
                  variants={subtitleVariants}
                  className="fp-sticker bg-white border-black/20 text-black/40"
                >
                  {section.subtitle}
                </motion.div>

                <motion.h3
                  variants={titleVariants}
                  className="editorial-title !text-5xl md:!text-7xl"
                >
                  {section.title}
                </motion.h3>

                <motion.p
                  variants={bodyVariants}
                  className="text-xl text-black/50 font-medium leading-relaxed max-w-lg"
                >
                  {section.description}
                </motion.p>
              </motion.div>

              {/* Image block */}
              <motion.div
                variants={imageVariants}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
