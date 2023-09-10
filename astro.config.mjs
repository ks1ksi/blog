import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { visit } from "unist-util-visit";

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
      () => {
        return (tree) => {
          visit(tree, "text", (node, index, parent) => {
            const obsidianImageRegex = /!\[\[([^\]]+)\]\]/g;
            let match;
            let lastIndex = 0;
            const newNodes = [];

            while ((match = obsidianImageRegex.exec(node.value)) !== null) {
              const [fullMatch, imageName] = match;
              const start = match.index;
              const end = obsidianImageRegex.lastIndex;

              if (start !== lastIndex) {
                newNodes.push({
                  type: "text",
                  value: node.value.slice(lastIndex, start),
                });
              }

              newNodes.push({
                type: "image",
                url: `/image/${imageName}`, // 경로를 `public/image`에 맞춰서 수정
                alt: imageName,
              });

              lastIndex = end;
            }

            if (newNodes.length > 0) {
              if (lastIndex < node.value.length) {
                newNodes.push({
                  type: "text",
                  value: node.value.slice(lastIndex),
                });
              }
              parent.children.splice(index, 1, ...newNodes);
            }
          });
        };
      },
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
