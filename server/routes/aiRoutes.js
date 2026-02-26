const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const City = require("../models/City");
const axios = require("axios");
const { ChatGroq } = require("@langchain/groq");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// Apply auth to all AI routes
router.use(authMiddleware);

// Initialize LLM
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.3
});


async function getWeatherData(userId) {
  const cities = await City.find({ userId });
  if (!cities.length) return null;

  return await Promise.all(
    cities.map(async (city) => {
      try {
        const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
          params: {
            q: city.name,
            appid: process.env.API_KEY,
            units: "metric"
          }
        });
        return {
          city: city.name,
          temp: response.data.main.temp,
          humidity: response.data.main.humidity,
          description: response.data.weather[0].description,
          rain: !!response.data.rain
        };
      } catch (e) {
        return { city: city.name, error: "Data unavailable" };
      }
    })
  );
}

router.post("/advisor", async (req, res) => {
  try {
    const weatherData = await getWeatherData(req.user.id);
    if (!weatherData) return res.json({ advice: "No cities added yet." });

    const systemPrompt = `You are a Weather Advisor. Analyze data and provide recommendations (humidity >80%, temp >35, rain).`;
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Data:\n${JSON.stringify(weatherData, null, 2)}`)
    ]);

    res.json({ advice: response.content });
  } catch (error) {
    res.status(500).json({ message: "Advisor failed" });
  }
});


router.post("/query", async (req, res) => {
  try {
    const { message } = req.body;
    const weatherData = await getWeatherData(req.user.id);
    
    const context = weatherData 
      ? `User's Cities: ${JSON.stringify(weatherData)}` 
      : "User has no cities.";

    const response = await llm.invoke([
      new SystemMessage("You are a helpful Weather Assistant. Answer questions based on the provided city data."),
      new HumanMessage(`${context}\n\nUser Question: ${message}`)
    ]);

    res.json({ reply: response.content });
  } catch (error) {
    res.status(500).json({ message: "Chat failed" });
  }
});

module.exports = router;