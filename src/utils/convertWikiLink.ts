import { visit } from "unist-util-visit";

// Obsidian wiki-link converter
export const convertWikiLink = () => {
    return (tree: any) => {
      visit(tree, "text", (node, index, parent) => {
        const obsidianLinkRegex = /\[\[([^\]]+)\]\]/g;
        let match;
        let lastIndex = 0;
        const newNodes = [];
  

        while ((match = obsidianLinkRegex.exec(node.value)) !== null) {
          let [fullMatch, linkName] = match;
          const start = match.index;
          const end = obsidianLinkRegex.lastIndex;
  
          if (start !== lastIndex) {
            newNodes.push({
              type: "text",
              value: node.value.slice(lastIndex, start),
            });
          }

          newNodes.push({
            type: "link",
            url: `/posts/${linkName.replace(/ /g, '-').toLowerCase()}`,
            children: [{ type: "text", value: linkName }],
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
  }
  