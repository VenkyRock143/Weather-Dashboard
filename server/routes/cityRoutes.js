const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  addCity,
  getCities,
  toggleFavorite,
  deleteCity
} = require("../controllers/cityController");


router.use(authMiddleware);

router.post("/", addCity);
router.get("/", getCities);
router.patch("/:id/favorite", toggleFavorite);
router.delete("/:id", deleteCity);

module.exports = router;