const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.API_KEY,
          units: "metric"
        }
      }
    );

    const data = response.data;

    res.json({
      city: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: data.wind.speed,
      visibility: data.visibility
    });

  } catch (err) {
    res.status(500).json({ message: "City not found" });
  }
});

module.exports = router;