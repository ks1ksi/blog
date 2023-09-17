import { visit } from "unist-util-visit";

// Obsidian image-link converter
export const convertImageLink = () => {
  return (tree: any) => {
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
};
