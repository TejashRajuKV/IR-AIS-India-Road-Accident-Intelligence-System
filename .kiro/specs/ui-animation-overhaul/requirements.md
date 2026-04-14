# Requirements Document

## Introduction

This feature overhauls the UI animations and interactive feel of the IR-AIS (Indian Road Accident Intelligence System) dashboard to match the cinematic, editorial aesthetic of fivepathways.com. The existing Next.js + TypeScript + Tailwind + Framer Motion codebase already has basic stagger animations, parallax, and a neobrutalist card system. This overhaul adds: smooth scroll via Lenis, clip-path text reveal animations, magnetic/tilt hover effects, a custom cursor, scroll-pinned narrative sections, image curtain reveals, an animated grain overlay, and enhanced counter/marquee sections — all while preserving the existing warm cream palette and neobrutalist design language.

## Glossary

- **System**: The IR-AIS Next.js frontend application
- **LenisScroller**: The Lenis smooth-scroll library instance that replaces native browser scroll
- **SplitText**: A utility that splits a string into individual word or character `<span>` elements for per-token animation
- **ClipReveal**: An animation technique where text or images are revealed by animating a `clip-path` mask from 0% to 100% height, creating a "curtain lift" effect
- **MagneticElement**: A UI element (button or card) that applies a subtle CSS transform toward the cursor position on hover, creating a magnetic pull effect
- **TiltCard**: A card component that applies a 3D perspective tilt transform based on cursor position within the card bounds
- **CustomCursor**: A custom HTML element that replaces the native OS cursor, following mouse position with a spring animation
- **PinnedSection**: A scroll section that uses `position: sticky` combined with Framer Motion's `useScroll` to pin the container while inner content animates through multiple states
- **CurtainReveal**: An image reveal animation where a solid overlay slides away (top-to-bottom or left-to-right) to expose the image beneath
- **GrainOverlay**: A fixed, full-viewport pseudo-element or canvas that renders animated SVG fractal noise at low opacity over all page content
- **CounterAnimation**: The existing `AnimatedCounter` component that counts from 0 to a target value using `requestAnimationFrame`
- **ScrollProgress**: The existing thin teal bar at the top of the viewport that tracks overall page scroll progress
- **MarqueeStrip**: The existing horizontally scrolling stats ticker
- **SectionNumber**: A decorative two-digit ordinal label (e.g., "01", "02") displayed alongside section headings with an animated horizontal line connector
