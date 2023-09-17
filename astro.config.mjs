import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { visit } from "unist-util-visit";
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
});
