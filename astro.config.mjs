import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import { convertImageLink } from "./src/utils/convertImageLink";
import { convertWikiLink } from "./src/utils/convertWikiLink";

// https://astro.build/config
export default defineConfig({
  site: "https://ks1ksi.github.io/", // replace this with your deployed domain
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
      // Convert Obsidian image syntax
      convertImageLink,
      // Convert Obsidian wiki link syntax
      convertWikiLink,
    ],
    shikiConfig: {
      theme: "dracula",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
