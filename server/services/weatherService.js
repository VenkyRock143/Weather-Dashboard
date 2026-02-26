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
    city: data.name,
  temp: data.main.temp,
  humidity: data.main.humidity,
  pressure: data.main.pressure,
  wind: data.wind.speed,
  visibility: data.visibility
  };
}

module.exports = { getWeather };