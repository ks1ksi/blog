import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import { convertImageLink } from "./src/utils/convertImageLink";
import { convertWikiLink } from "./src/utils/convertWikiLink";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      remarkMath,
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
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: "dracula",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
