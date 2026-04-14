"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMagnetic } from "@/frontend/hooks/useMagnetic";
import useCursorStore from "@/frontend/hooks/useCursorStore";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 0.35,
}: MagneticButtonProps) {
  const { ref, style, onPointerMove, onPointerLeave } = useMagnetic({ strength });
  const setCursorState = useCursorStore((s) => s.setCursorState);

  const handlePointerEnter = () => {
    setCursorState("hover");
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    setCursorState("default");
    onPointerLeave(e);
  };

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={style}
      onPointerMove={onPointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      data-cursor="hover"
      className={className}
    >
      {children}
    </motion.div>
  );
}
