import type { SupplyChainPosture } from "./fixture";

export type ActivityVisualScale = {
  minCode: number;
  maxCode: number;
  maxCommits: number;
  maxCommitBucket: number;
};

export function activityScaleOf(
  postures: SupplyChainPosture[],
): ActivityVisualScale {
  const measured = postures.flatMap(({ activity }) =>
    activity === null ? [] : [activity],
  );
  if (measured.length === 0)
    throw new Error("activity comparison requires measured repositories");

  const codeSizes = measured.map(({ totalCode }) => totalCode);
  const minCode = Math.min(...codeSizes);
  const maxCode = Math.max(...codeSizes);
  const maxCommits = Math.max(...measured.map(({ commits }) => commits.total));
  const maxCommitBucket = Math.max(
    ...measured.flatMap(({ commits }) => commits.buckets),
  );
  if (minCode <= 0 || maxCode === minCode)
    throw new Error(
      `code-size scale requires distinct positive bounds, received ${minCode}-${maxCode}`,
    );
  if (maxCommits <= 0)
    throw new Error(
      `commit-activity scale requires a positive maximum, received ${maxCommits}`,
    );
  if (maxCommitBucket <= 0)
    throw new Error(
      `commit-cadence scale requires a positive maximum, received ${maxCommitBucket}`,
    );

  return { minCode, maxCode, maxCommits, maxCommitBucket };
}

function assertScaleValue(value: number, maximum: number, label: string) {
  if (maximum <= 0 || value < 0 || value > maximum)
    throw new Error(
      `${label} ${value} is outside the 0-${maximum} comparison scale`,
    );
}

export function logPercent(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (minimum <= 0 || value < minimum || value > maximum)
    throw new Error(
      `code size ${value} is outside the ${minimum}-${maximum} comparison scale`,
    );
  return (
    ((Math.log10(value) - Math.log10(minimum)) /
      (Math.log10(maximum) - Math.log10(minimum))) *
    100
  );
}

export function sqrtPercent(value: number, maximum: number): number {
  assertScaleValue(value, maximum, "commit activity");
  return Math.sqrt(value / maximum) * 100;
}
