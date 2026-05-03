.PHONY: build test clean

build:
	pnpm run build

test:
	pnpm run test

clean:
	rm -rf packages/ui/dist apps/kitchen-sink/dist apps/storybook/storybook-static
