const { randomUUID } = require("crypto");
const { readContent, updateContent } = require("../services/contentStore");

const projectFields = [
  "name", "slug", "type", "location", "category", "image", "description",
  "overview", "designFocus", "area", "year", "highlights", "gallery",
];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateProject(input, partial = false) {
  const project = {};
  for (const field of projectFields) {
    if (input[field] === undefined && partial) continue;
    if (input[field] === undefined) {
      return `The ${field} field is required.`;
    }

    const value = input[field];
    if (["highlights", "gallery"].includes(field)) {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        return `${field} must be a list of text values.`;
      }
      project[field] = value.slice(0, 12);
      continue;
    }

    if (typeof value !== "string" || value.trim().length === 0 || value.length > 5000) {
      return `${field} must be a non-empty text value (maximum 5,000 characters).`;
    }
    project[field] = value.trim();
  }

  if (project.slug && !slugPattern.test(project.slug)) {
    return "Project URL must use lowercase letters, numbers, and hyphens.";
  }
  return project;
}

async function getPublicContent(req, res, next) {
  try {
    const content = await readContent();
    return res.json({ success: true, data: content });
  } catch (error) {
    return next(error);
  }
}

async function getAdminContent(req, res, next) {
  try {
    const content = await readContent();
    return res.json({ success: true, data: content });
  } catch (error) {
    return next(error);
  }
}

async function updatePage(req, res, next) {
  const { pageId } = req.params;
  const allowedPages = ["home", "gallery", "about", "contact"];
  if (!allowedPages.includes(pageId)) {
    return res.status(404).json({ success: false, message: "Page not found." });
  }

  const update = {};
  const allowedFields = [
    "eyebrow", "title", "description", "image", "sectionEyebrow",
    "sectionTitle", "sectionDescription", "bodyTitle", "bodyText", "bodyText2",
    "bodyImage", "contactEmail", "contactLocation", "contactHours",
  ];
  for (const field of allowedFields) {
    const value = req.body[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length > 5000) {
      return res.status(400).json({ success: false, message: `${field} must be text no longer than 5,000 characters.` });
    }
    update[field] = value.trim();
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ success: false, message: "Provide at least one page field to update." });
  }

  try {
    const page = await updateContent((content) => {
      content.pages[pageId] = { ...content.pages[pageId], ...update };
      return content.pages[pageId];
    });
    return res.json({ success: true, data: page });
  } catch (error) {
    return next(error);
  }
}

async function createProject(req, res, next) {
  const project = validateProject(req.body);
  if (typeof project === "string") {
    return res.status(400).json({ success: false, message: project });
  }

  try {
    const created = await updateContent((content) => {
      if (content.projects.some((item) => item.slug === project.slug)) {
        const conflict = new Error("A project with this URL already exists.");
        conflict.status = 409;
        throw conflict;
      }
      const newProject = { id: randomUUID(), ...project };
      content.projects.unshift(newProject);
      return newProject;
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function updateProject(req, res, next) {
  const project = validateProject(req.body, true);
  if (typeof project === "string") {
    return res.status(400).json({ success: false, message: project });
  }

  try {
    const updated = await updateContent((content) => {
      const index = content.projects.findIndex((item) => item.id === req.params.projectId);
      if (index < 0) {
        const missing = new Error("Project not found.");
        missing.status = 404;
        throw missing;
      }
      if (project.slug && content.projects.some(
        (item, itemIndex) => item.slug === project.slug && itemIndex !== index,
      )) {
        const conflict = new Error("A project with this URL already exists.");
        conflict.status = 409;
        throw conflict;
      }
      content.projects[index] = { ...content.projects[index], ...project };
      return content.projects[index];
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const removed = await updateContent((content) => {
      const index = content.projects.findIndex((item) => item.id === req.params.projectId);
      if (index < 0) {
        const missing = new Error("Project not found.");
        missing.status = 404;
        throw missing;
      }
      return content.projects.splice(index, 1)[0];
    });
    return res.json({ success: true, data: removed });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProject,
  deleteProject,
  getAdminContent,
  getPublicContent,
  updatePage,
  updateProject,
};
