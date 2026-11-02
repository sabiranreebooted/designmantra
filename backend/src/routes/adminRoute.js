const express = require("express");
const { login } = require("../controllers/adminController");
const {
  createProject,
  deleteProject,
  getAdminContent,
  updatePage,
  updateProject,
} = require("../controllers/contentController");
const { requireAdmin } = require("../middleware/adminAuth");
const { imageUpload, respondWithUploads } = require("../controllers/uploadController");

const router = express.Router();

router.post("/login", login);
router.use(requireAdmin);
router.get("/content", getAdminContent);
router.put("/pages/:pageId", updatePage);
router.post("/projects", createProject);
router.put("/projects/:projectId", updateProject);
router.delete("/projects/:projectId", deleteProject);
router.post("/uploads", imageUpload.array("images", 8), respondWithUploads);

module.exports = router;
