import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://clicky-ui.flanksource.com",
  integrations: [
    starlight({
      title: "Clicky UI",
      description:
        "React components and schema-driven UI primitives from Flanksource.",
      customCss: ["./src/styles/docs.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/flanksource/clicky-ui",
        },
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Overview", slug: "index" },
            { label: "Getting started", slug: "getting-started" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "JSON Schema form", slug: "guides/json-schema-form" },
            {
              label: "JSON Schema examples",
              slug: "guides/json-schema-form-examples",
            },
          ],
        },
        {
          label: "Reference",
          items: [
            {
              label: "JSON Schema extensions",
              slug: "reference/json-schema-form-extensions",
            },
            { label: "Component overview", slug: "reference/components" },
            {
              label: "Components",
              collapsed: true,
              items: [
                {
                  label: "Inputs & layout",
                  collapsed: true,
                  autogenerate: {
                    directory: "reference/components/inputs-layout",
                  },
                },
                {
                  label: "Data display",
                  collapsed: true,
                  autogenerate: {
                    directory: "reference/components/data-display",
                  },
                },
                {
                  label: "AI",
                  collapsed: true,
                  autogenerate: { directory: "reference/components/ai" },
                },
                {
                  label: "Chat",
                  collapsed: true,
                  autogenerate: { directory: "reference/components/chat" },
                },
                {
                  label: "Comments",
                  collapsed: true,
                  autogenerate: {
                    directory: "reference/components/comments",
                  },
                },
                {
                  label: "RPC",
                  collapsed: true,
                  autogenerate: { directory: "reference/components/rpc" },
                },
                {
                  label: "Diagnostics",
                  collapsed: true,
                  autogenerate: {
                    directory: "reference/components/diagnostics",
                  },
                },
                {
                  label: "Cache",
                  collapsed: true,
                  autogenerate: { directory: "reference/components/cache" },
                },
                {
                  label: "Git",
                  collapsed: true,
                  autogenerate: { directory: "reference/components/git" },
                },
                {
                  label: "Test runner",
                  collapsed: true,
                  autogenerate: {
                    directory: "reference/components/test-runner",
                  },
                },
                {
                  label: "Other",
                  collapsed: true,
                  autogenerate: { directory: "reference/components/other" },
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
