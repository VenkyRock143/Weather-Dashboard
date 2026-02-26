const { ChatGroq } = require("@langchain/groq");
const { createOpenAIFunctionsAgent, AgentExecutor } = require("langchain/agents");
const { DynamicTool } = require("@langchain/core/tools");
const { getUserCities } = require("./tools");
const { getWeather } = require("../services/weatherService");

async function createWeatherAgent(userId) {
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.3
});

  const tools = [
    new DynamicTool({
      name: "getUserCities",
      description: "Returns all cities saved by the user",
      func: async () => {
        const cities = await getUserCities(userId);
        return JSON.stringify(cities);
      }
    }),

    new DynamicTool({
      name: "getWeather",
      description: "Get current weather data for a city",
      func: async (cityName) => {
        const weather = await getWeather(cityName);
        return JSON.stringify(weather);
      }
    })
  ];

  const agent = await initializeAgentExecutorWithOptions(
    tools,
    model,
    {
      agentType: "zero-shot-react-description",
      verbose: true
    }
  );

  return agent;
}

module.exports = { createWeatherAgent };