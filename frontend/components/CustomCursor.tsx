"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import useCursorStore from "@/hooks/useCursorStore";

export default function CustomCursor() {
  // SSR guard
  if (typeof window === "undefined") return null;

  return <CustomCursorInner />;
}

function CustomCursorInner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const cursorState = useCursorStore((s) => s.cursorState);

  // Raw mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Dot follows directly (fast spring)
  const dotX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const dotY = useSpring(mouseY, { stiffness: 500, damping: 28 });

  // Ring follows with lag (slow spring)
  const ringX = useSpring(mouseX, { stiffness: 150, damping: 18 });
  const ringY = useSpring(mouseY, { stiffness: 150, damping: 18 });

  useEffect(() => {
    // Check for touch device
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    // Hide native cursor
    document.documentElement.style.cursor = "none";

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.documentElement.style.cursor = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (isTouchDevice) return null;

  // State-based sizes
  const dotSize = cursorState === "text" ? 4 : 8;
  const ringSize = cursorState === "hover" ? 56 : cursorState === "text" ? 24 : 32;
  const ringBg =
    cursorState === "hover" ? "rgba(107,196,179,0.15)" : "transparent";

  const sharedStyle: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 9998,
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
  };

  return (
    <motion.div
      style={{ opacity: isVisible ? 1 : 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Dot */}
      <motion.div
        style={{
          ...sharedStyle,
          x: dotX,
          y: dotY,
          width: dotSize,
          height: dotSize,
          backgroundColor: "#6bc4b3",
        }}
        animate={{ width: dotSize, height: dotSize }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Ring */}
      <motion.div
        style={{
          ...sharedStyle,
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          border: "2px solid black",
          backgroundColor: ringBg,
        }}
        animate={{ width: ringSize, height: ringSize, backgroundColor: ringBg }}
        transition={{ type: "spring", stiffness: 150, damping: 18 }}
      />
    </motion.div>
  );
}
