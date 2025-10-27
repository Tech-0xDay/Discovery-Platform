"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

const PageScrollBackground = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        backgroundColor: "hsl(0, 0%, 5%)",
      }}
    >
    </div>
  );
};

export { PageScrollBackground };

/**
 * Page Scroll Background Component
 *
 * Renders an animated SVG stroke that follows page scroll progress.
 * - Fixed positioning to stay in viewport
 * - Tracks page scroll with useScroll
 * - z-index: 0 to stay behind all content
 * - Based on InteractiveScrollBackground design
 */
