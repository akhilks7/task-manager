"use client";

import React, { useEffect, useRef, useState } from "react";

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  separator?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({
  to,
  from = 0,
  duration = 1.2,
  separator = ",",
  className = "",
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const [count, setCount] = useState<number>(from);
  const countRef = useRef<number>(from);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    const startValue = countRef.current;
    const totalDuration = duration * 1000;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min(
        (timestamp - startTimeRef.current) / totalDuration,
        1
      );
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(startValue + (to - startValue) * easedProgress);

      countRef.current = current;
      setCount(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [to, duration]);

  const formatted = count.toLocaleString("en-US").replace(/,/g, separator);

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default CountUp;
