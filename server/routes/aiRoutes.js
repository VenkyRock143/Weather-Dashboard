const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const City = require("../models/City");
const axios = require("axios");

const { ChatGroq } = require("@langchain/groq");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

router.use(authMiddleware);

router.post("/advisor", async (req, res) => {
  try {
    const cities = await City.find({ userId: req.user.id });

    if (!cities.length) {
      return res.json({ advice: "You have not added any cities yet." });
    }

    const weatherData = await Promise.all(
      cities.map(async (city) => {
        const response = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              q: city.name,
              appid: process.env.API_KEY,
              units: "metric"
            }
          }
        );

        return {
          city: city.name,
          temp: response.data.main.temp,
          humidity: response.data.main.humidity,
          description: response.data.weather[0].description,
          rain: response.data.rain ? true : false
        };
      })
    );

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      temperature: 0.3
    });

    const systemPrompt = `
You are an intelligent Weather Advisor.

You are given live weather data for user's saved cities.
Analyze carefully and provide helpful recommendations.

Rules:
- If high humidity (>80%), warn about discomfort.
- If temperature >35°C, warn about heat.
- If rain detected, suggest umbrella.
- Compare cities when relevant.
- Respond clearly and naturally.
    `;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(
        `Here is the weather data:\n${JSON.stringify(weatherData, null, 2)}`
      )
    ]);

    res.json({ advice: response.content });

  } catch (error) {
    console.error("Advisor error:", error);
    res.status(500).json({ message: "AI failed" });
  }
});

module.exports = router;