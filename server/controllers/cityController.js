const City = require("../models/City");
const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes


// ADD CITY
exports.addCity = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await City.findOne({
      name,
      userId: req.user.id
    });

    if (exists) {
      return res.status(400).json({
        message: "City already added"
      });
    }

    const city = await City.create({
      name,
      userId: req.user.id
    });

    res.status(201).json(city);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET USER CITIES (WITH WEATHER DATA)
// exports.getCities = async (req, res) => {

//   const calculateRisk = (temp, humidity) => {
//     if (temp > 35) return "High Heat Risk";
//     if (temp < 5) return "Cold Risk";
//     if (humidity > 80) return "High Humidity";
//     return "Normal";
//   };

//   try {
//     const cities = await City.find({ userId: req.user.id });

//     const enrichedCities = await Promise.all(
//       cities.map(async (city) => {

//         const cacheKey = `weather_${city.name}`;
//         let weatherData = cache.get(cacheKey);

//         if (!weatherData) {
//           const weatherRes = await axios.get(
//             "https://api.openweathermap.org/data/2.5/weather",
//             {
//               params: {
//                 q: city.name,
//                 appid: process.env.API_KEY,
//                 units: "metric"
//               }
//             }
//           );

//           weatherData = weatherRes.data.main;
//           cache.set(cacheKey, weatherData);
//         }

//         return {
//           _id: city._id,
//           name: city.name,
//           isFavorite: city.isFavorite,
//           weather: weatherData,
//           risk: calculateRisk(weatherData.temp, weatherData.humidity)
//         };
//       })
//     );

//     res.json(enrichedCities);

//   } catch (error) {
//     console.error("Error in getCities:", error.message);
//     res.status(500).json({ message: "Failed to fetch cities" });
//   }
// };
exports.getCities = async (req, res) => {
  const calculateRisk = (temp, humidity) => {
    if (temp > 35) return "High Heat Risk";
    if (temp < 5) return "Cold Risk";
    if (humidity > 80) return "High Humidity";
    return "Normal";
  };

  try {
    const cities = await City.find({ userId: req.user.id });

    const enrichedCities = await Promise.all(
      cities.map(async (city) => {
        try {
          const cacheKey = `weather_${city.name}`;
          let weatherData = cache.get(cacheKey);

          if (!weatherData) {
            const weatherRes = await axios.get(
              "https://api.openweathermap.org/data/2.5/weather",
              {
                params: {
                  q: city.name,
                  appid: process.env.API_KEY,
                  units: "metric"
                }
              }
            );
            // Store the WHOLE main object
            weatherData = weatherRes.data.main;
            cache.set(cacheKey, weatherData);
          }

          // Defensive check: if weatherData is empty for some reason
          const temp = weatherData?.temp ?? 0;
          const humidity = weatherData?.humidity ?? 0;

          return {
            _id: city._id,
            name: city.name,
            isFavorite: city.isFavorite,
            weather: {
              temp: temp,
              humidity: humidity
            },
            risk: calculateRisk(temp, humidity)
          };
        } catch (innerError) {
          // If one city fails (e.g. 404), don't crash the whole list!
          console.error(`City ${city.name} failed:`, innerError.message);
          return {
            _id: city._id,
            name: city.name,
            isFavorite: city.isFavorite,
            weather: { temp: 0, humidity: 0, error: true },
            risk: "Unknown"
          };
        }
      })
    );

    res.json(enrichedCities);

  } catch (error) {
    console.error("Critical Error in getCities:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// TOGGLE FAVORITE
exports.toggleFavorite = async (req, res) => {
  try {

    const city = await City.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!city) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    city.isFavorite = !city.isFavorite;
    await city.save();

    res.json(city);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE CITY
exports.deleteCity = async (req, res) => {
  try {

    const city = await City.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!city) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    res.json({ message: "City removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
