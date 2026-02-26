const axios = require("axios");

async function getWeather(cityName) {
  const response = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        q: cityName,
        appid: process.env.API_KEY,
        units: "metric"
      }
    }
  );

  return {
    city: response.data.name,
    temp: response.data.main.temp,
    humidity: response.data.main.humidity,
    rain: response.data.rain?.["1h"] || 0,
    description: response.data.weather[0].description
  };
}

module.exports = { getWeather };