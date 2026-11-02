const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const defaults = require("../data/defaultContent");

const dataDirectory = path.join(__dirname, "../../data");
const contentPath = path.join(dataDirectory, "site-content.json");
let writeQueue = Promise.resolve();

async function readContent() {
  try {
    const raw = await fs.readFile(contentPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;

    await fs.mkdir(dataDirectory, { recursive: true });
    const initial = {
      pages: defaults.pages,
      projects: defaults.projects.map((project) => ({ id: randomUUID(), ...project })),
    };
    await fs.writeFile(contentPath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

function updateContent(updater) {
  const operation = writeQueue.then(async () => {
    const content = await readContent();
    const result = await updater(content);
    await fs.mkdir(dataDirectory, { recursive: true });
    const temporaryPath = `${contentPath}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(content, null, 2), "utf8");
    await fs.rename(temporaryPath, contentPath);
    return result;
  });

  writeQueue = operation.catch(() => {});
  return operation;
}

module.exports = { readContent, updateContent };
