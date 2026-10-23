import { composeStory } from '@storybook/react';
import { afterAll } from 'vitest';

// WORKAROUND(storybook-last-story-mounted): Storybook unmounts a story only when the next story in the same file loads, so each file's last story stays mounted; under vmThreads the reused worker then commits its late async updates after jsdom's `document` is gone. A composed story's load() first runs the pending cleanups, which unmounts it.
// Correct fix: @storybook/addon-vitest unmounts the final story when a test file finishes.
// Ref: discussed with user 2026-10-23
afterAll(async () => {
  await composeStory({ render: () => <></> }, { title: 'Teardown' }).load();
});
