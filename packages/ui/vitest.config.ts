import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

const SCRIPTS = "scripts/**/*.test.ts"

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      environment: "jsdom",
      pool: 'vmThreads',
      maxWorkers: 2,
      projects: [
        { extends: true, test: { name: "unit", exclude: [...configDefaults.exclude, SCRIPTS] } },
        // Build/CI script checks evaluate Node tooling (Vite, Storybook's
        // vitest plugin) that calls module.register or rolldown's native
        // binding, neither of which works inside a vmThreads vm realm.
        // extends concatenates `include` with the root's, so exclude the rest.
        { extends: true, test: { name: "scripts", include: [SCRIPTS], exclude: [...configDefaults.exclude, "src/**", "oxlint-plugins/**"], pool: 'forks' } },
      ],
    },
  })
))
