/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ActivityComparison } from "./activity-variants";
import {
  activityScaleOf,
  logPercent,
  sqrtPercent,
} from "./activity-visual-scale";
import { POSTURES } from "./fixture";

afterEach(cleanup);

const measured = POSTURES.filter(({ activity }) => activity !== null);

describe("compact activity visual alternatives", () => {
  it("derives one estate-wide scale for every alternative", () => {
    const scale = activityScaleOf(measured);

    expect(scale).toEqual({
      minCode: 968,
      maxCode: 3_802_127,
      maxCommits: 109,
      maxCommitBucket: 68,
    });
    expect(logPercent(scale.maxCode, scale.minCode, scale.maxCode)).toBe(100);
    expect(logPercent(scale.minCode, scale.minCode, scale.maxCode)).toBe(0);
    expect(sqrtPercent(scale.maxCommits, scale.maxCommits)).toBe(100);
    expect(sqrtPercent(0, scale.maxCommits)).toBe(0);
  });

  it("renders four pairings with separate code and commit visuals", () => {
    const { container } = render(
      <ActivityComparison
        postures={measured.slice(0, 6)}
        scale={activityScaleOf(measured)}
      />,
    );

    expect(container.querySelectorAll("[data-activity-variant]")).toHaveLength(
      4,
    );
    expect(
      container.querySelector('[data-activity-variant="heat-scales"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-activity-variant="bar-spark"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-activity-variant="bubble-cadence"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-activity-variant="steps-total"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-code-heat-legend="true"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-commit-heat-legend="true"]'),
    ).not.toBeNull();
    expect(container.querySelector("[data-bivariate-visual]")).toBeNull();

    for (const { repository } of measured.slice(0, 6)) {
      const rows = container.querySelectorAll(
        `[data-activity-repository="${repository}"]`,
      );
      expect(rows).toHaveLength(4);
      for (const row of rows) {
        expect(
          row.querySelector(`[data-code-visual][aria-label^="${repository}:"]`),
        ).not.toBeNull();
        expect(
          row.querySelector(
            `[data-commit-visual][aria-label^="${repository}:"]`,
          ),
        ).not.toBeNull();
      }
    }
  });
});
