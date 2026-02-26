const { createWeatherAgent } = require("../ai/agent");

exports.askAgent = async (req, res) => {
  try {
    const { question } = req.body;

    const agent = await createWeatherAgent(req.user.id);

    const result = await agent.invoke({
      input: question
    });

    res.json({ answer: result.output });

  } catch (error) {
    res.status(500).json({
      message: "AI agent failed",
      error: error.message
    });
  }
};
