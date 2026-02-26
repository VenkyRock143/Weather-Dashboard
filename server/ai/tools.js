const City = require("../models/City");

async function getUserCities(userId) {
  const cities = await City.find({ userId });
  return cities.map(c => ({
    name: c.name,
    isFavorite: c.isFavorite
  }));
}

module.exports = { getUserCities };