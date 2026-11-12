// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/tests/race-promise-with-abort.test.ts
import { describe, expect, it } from "vitest";
import {
  ABORTED_PROMISE_RESULT,
  racePromiseWithAbort,
} from "../src/utils/race-promise-with-abort.js";

describe("racePromiseWithAbort", () => {
  it("returns a completed result", async () => {
    const abortController = new AbortController();

    await expect(
      racePromiseWithAbort(Promise.resolve("completed"), abortController.signal),
    ).resolves.toBe("completed");
  });

  it("stops waiting when aborted", async () => {
    const abortController = new AbortController();
    const pendingResult = Promise.withResolvers<string>();
    const result = racePromiseWithAbort(pendingResult.promise, abortController.signal);

    abortController.abort();

    await expect(result).resolves.toBe(ABORTED_PROMISE_RESULT);
  });
});
