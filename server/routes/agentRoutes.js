const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { askAgent } = require("../controllers/agentController");

router.post("/query", authMiddleware, askAgent);

module.exports = router;