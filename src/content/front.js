const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

function updateFrontMatter(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      updateFrontMatter(fullPath);
    } else if (path.extname(file) === ".md") {
      const content = fs.readFileSync(fullPath, "utf8");
      const parsed = matter(content);

      // Log for debugging
      console.log("Before modification:", parsed.data);

      // Modify Front Matter
      parsed.data = {
        title: parsed.data.title,
        author: "Seungil Kim",
        pubDatetime: parsed.data.pubDatetime,
        tags: [],
        featured: false,
        description: "",
        ogImage: "",
        postSlug: parsed.data.title,
      };

      // Log for debugging
      console.log("After modification:", parsed.data);

      const newContent = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(fullPath, newContent);
    }
  });
}

const rootDirectoryPath = path.join(__dirname, "blog");
updateFrontMatter(rootDirectoryPath);
