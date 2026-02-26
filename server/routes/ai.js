const express = require("express");
const router = express.Router();
const { weatherAgent } = require("../services/agent");

router.post("/query", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await weatherAgent(message, req.user.id);

    res.json({ reply: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI failed" });
  }
});

module.exports = router;
