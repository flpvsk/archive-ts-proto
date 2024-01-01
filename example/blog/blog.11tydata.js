const fs = require("fs/promises");

module.exports = {
  eleventyComputed: {
    excerpt: async (data) => {
      const content = await fs.readFile(data.page.inputPath, "utf8");
      const contentSplit = content.split("<!-- excerpt -->");

      if (contentSplit.length === 0) {
        return "";
      }

      return contentSplit[1];
    },
  },
};
