const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
