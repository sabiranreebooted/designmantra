const express = require("express");
const { getPublicContent } = require("../controllers/contentController");

const router = express.Router();

router.get("/", getPublicContent);

module.exports = router;
