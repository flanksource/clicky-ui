.PHONY: build icons test clean handoff

export PATH := /opt/homebrew/opt/node@24/bin:/usr/local/opt/node/bin:$(PATH)

build:
	pnpm run build

# Rebuild Storybook's story index and regenerate handoff.yaml with one
# bare-iframe URL per Docs page (baseUrl -> Storybook dev server :5270).
handoff:
	pnpm --filter storybook build
	node hack/gen-handoff.mjs

icons:
	pnpm --filter @flanksource/clicky-ui build:icons:force

test:
	pnpm run test

clean:
	rm -rf packages/ui/dist apps/kitchen-sink/dist apps/storybook/storybook-static
