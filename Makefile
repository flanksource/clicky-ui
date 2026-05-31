.PHONY: build icons test clean

build:
	pnpm run build

icons:
	pnpm --filter @flanksource/clicky-ui build:icons:force

test:
	pnpm run test

clean:
	rm -rf packages/ui/dist apps/kitchen-sink/dist apps/storybook/storybook-static
