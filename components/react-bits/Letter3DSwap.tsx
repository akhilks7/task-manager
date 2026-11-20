"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Unicode-aware character segmenter (emojis & multi-byte characters safe)
function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}

export interface Letter3DSwapProps {
  children: string;
  mainClassName?: string;
  frontFaceClassName?: string;
  secondFaceClassName?: string;
  rotateDirection?: "top" | "bottom" | "left" | "right";
  staggerDuration?: number;
}

export function Letter3DSwap({
  children,
  mainClassName = "",
  frontFaceClassName = "",
  secondFaceClassName = "",
  rotateDirection = "top",
  staggerDuration = 0.025,
}: Letter3DSwapProps) {
  const [isSelfHovered, setIsSelfHovered] = useState(false);

  const words = useMemo(() => {
    const tokens = children.split(" ");
    let counter = 0;
    return tokens.map((word, wIdx) => {
      const chars = splitIntoCharacters(word).map((char) => ({
        char,
        index: counter++,
      }));
      if (wIdx < tokens.length - 1) {
        counter++; // account for space in stagger timing
      }
      return {
        word,
        chars,
        hasTrailingSpace: wIdx < tokens.length - 1,
      };
    });
  }, [children]);

  // Compute 3D geometry based on direction
  const getTransformConfig = () => {
    switch (rotateDirection) {
      case "bottom":
        return {
          activeTransform: "rotateX(-90deg)",
          secondFaceTransform: "rotateX(90deg) translateZ(0.55em)",
          groupClass: "group-hover:group-letter-swap-bottom",
        };
      case "left":
        return {
          activeTransform: "rotateY(90deg)",
          secondFaceTransform: "rotateY(-90deg) translateZ(0.55em)",
          groupClass: "group-hover:group-letter-swap-left",
        };
      case "right":
        return {
          activeTransform: "rotateY(-90deg)",
          secondFaceTransform: "rotateY(90deg) translateZ(0.55em)",
          groupClass: "group-hover:group-letter-swap-right",
        };
      case "top":
      default:
        return {
          activeTransform: "rotateX(90deg)",
          secondFaceTransform: "rotateX(-90deg) translateZ(0.55em)",
          groupClass: "group-hover:group-letter-swap-top",
        };
    }
  };

  const { activeTransform, secondFaceTransform, groupClass } = getTransformConfig();

  return (
    <span
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      className={cn(
        "inline-flex flex-wrap items-center select-none cursor-pointer",
        mainClassName
      )}
    >
      {words.map((wordObj, wIdx) => (
        <span key={wIdx} className="inline-flex whitespace-nowrap">
          {wordObj.chars.map(({ char, index }) => (
            <span
              key={index}
              className="relative inline-block leading-none"
              style={{ perspective: "600px" }}
            >
              <span
                className={cn(
                  "relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  groupClass
                )}
                style={{
                  transformStyle: "preserve-3d",
                  transitionDelay: `${index * staggerDuration}s`,
                  transform: isSelfHovered ? activeTransform : undefined,
                }}
              >
                {/* Front Face */}
                <span
                  className={cn(
                    "inline-block [backface-visibility:hidden]",
                    frontFaceClassName
                  )}
                  style={{
                    transform: "translateZ(0.55em)",
                  }}
                >
                  {char}
                </span>

                {/* Second / Reveal Face */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 inline-flex items-center justify-center [backface-visibility:hidden]",
                    secondFaceClassName
                  )}
                  style={{
                    transform: secondFaceTransform,
                  }}
                >
                  {char}
                </span>
              </span>
            </span>
          ))}
          {wordObj.hasTrailingSpace && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}

export default Letter3DSwap;
