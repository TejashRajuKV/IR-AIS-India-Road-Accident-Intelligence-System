import { useRef } from "react";
import { useMotionValue, animate, MotionValue } from "framer-motion";

interface UseMagneticOptions {
  strength?: number; // 0–1, default 0.35
  maxOffset?: number; // px, default 12
}

interface UseMagneticReturn {
  ref: React.RefObject<HTMLElement>;
  style: { x: MotionValue<number>; y: MotionValue<number> };
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
}

export function useMagnetic({
  strength = 0.35,
  maxOffset = 12,
}: UseMagneticOptions = {}): UseMagneticReturn {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Check for touch-only device (coarse pointer = no fine pointer support)
  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const onPointerMove = (e: React.PointerEvent) => {
    if (isTouchDevice || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    const rawX = deltaX * strength;
    const rawY = deltaY * strength;

    // Clamp to maxOffset
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, rawX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, rawY));

    x.set(clampedX);
    y.set(clampedY);
  };

  const onPointerLeave = () => {
    if (isTouchDevice) return;

    animate(x, 0, { type: "spring", stiffness: 150, damping: 15 });
    animate(y, 0, { type: "spring", stiffness: 150, damping: 15 });
  };

  if (isTouchDevice) {
    return {
      ref,
      style: { x: useMotionValue(0), y: useMotionValue(0) },
      onPointerMove: () => {},
      onPointerLeave: () => {},
    };
  }

  return {
    ref,
    style: { x, y },
    onPointerMove,
    onPointerLeave,
  };
}
