import { useCallback, useLayoutEffect, useState } from "react";

export function runtimeBarInlineCount({
  width,
  identity,
  trigger,
  fields,
  gap,
}: {
  width: number;
  identity: number;
  trigger: number;
  fields: number[];
  gap: number;
}) {
  let occupied = identity + trigger + gap;
  let count = 0;
  for (const field of fields) {
    occupied += field + gap;
    if (occupied > width) break;
    count++;
  }
  return count;
}

export function useRuntimeBarOverflow() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [measurement, setMeasurement] = useState<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(Infinity);

  const measure = useCallback(() => {
    if (!container || !measurement) return;
    const width = container.getBoundingClientRect().width;
    if (width <= 0) return;
    const [identity, ...controls] = [...measurement.children];
    const trigger = controls.pop();
    if (!identity || !trigger)
      throw new Error(
        "Runtime bar measurement requires identity and a menu trigger",
      );
    const spacing = getComputedStyle(measurement).columnGap;
    const gap =
      spacing === "normal" || spacing === "" ? 0 : Number.parseFloat(spacing);
    if (!Number.isFinite(gap))
      throw new Error(`Invalid runtime bar spacing: ${spacing}`);
    const count = runtimeBarInlineCount({
      width: width - 2,
      identity: identity.getBoundingClientRect().width,
      trigger: trigger.getBoundingClientRect().width,
      fields: controls.map((node) => node.getBoundingClientRect().width),
      gap,
    });
    setVisibleCount((previous) => (previous === count ? previous : count));
  }, [container, measurement]);

  useLayoutEffect(() => {
    measure();
  });

  useLayoutEffect(() => {
    if (!container || !measurement) return;
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(container);
    observer?.observe(measurement);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [container, measurement, measure]);

  return {
    containerRef: setContainer,
    measurementRef: setMeasurement,
    visibleCount,
  };
}
