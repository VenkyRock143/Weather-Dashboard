const { ChatGroq } = require("@langchain/groq");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const City = require("../models/City");
const axios = require("axios");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache

exports.weatherAgent = async (message, userId) => {
    try {
        // 1️⃣ Get user cities
        const cities = await City.find({ userId });

        if (!cities.length) {
            return "You have not added any cities yet.";
        }

        // 2️⃣ Fetch weather for each city
        const weatherData = await Promise.all(
            cities.map(async (city) => {
                const cacheKey = `weather_${city.name}`;
                let data = cache.get(cacheKey);

                if (!data) {
                    const res = await axios.get(
                        "https://api.openweathermap.org/data/2.5/weather",
                        {
                            params: {
                                q: city.name,
                                appid: process.env.API_KEY,
                                units: "metric",
                            },
                        }
                    );

                    data = {
                        temp: res.data.main.temp,
                        humidity: res.data.main.humidity,
                        description: res.data.weather[0].description,
                        rain: res.data.rain ? true : false,
                    };

                    cache.set(cacheKey, data);
                }

                return {
                    city: city.name,
                    ...data,
                };
            })
        );

        // 3️⃣ Initialize LLM
        const llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant",
            temperature: 0.3
        });

        // 4️⃣ Build smart system prompt
        const systemPrompt = `
You are a Weather Intelligence Assistant.

You are given live weather data of user's saved cities.
Use this data to answer questions intelligently.

Weather Data:
${JSON.stringify(weatherData, null, 2)}

Rules:
- If asked about umbrella → check rain or weather description
- If asked about humidity → compare humidity values
- If asked about hottest → compare temperatures
- Always respond in natural, helpful language
`;

        // 5️⃣ Ask LLM
        const response = await llm.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(message),
        ]);

        return response.content;

    } catch (error) {
        console.error("Agent error:", error);
        return "Sorry, I couldn't process your request.";
    }
};