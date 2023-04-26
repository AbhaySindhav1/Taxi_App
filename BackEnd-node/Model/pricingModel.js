const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  DriverProfit: {
    type: Number,
    required: true,
  },
  MinFarePrice: {
    type: Number,
    required: true,
  },
  BasePriceDistance: {
    type: String,
    required: true,
  },
  BasePrice: {
    type: Number,
    required: true,
  },
  DistancePrice: {
    type: Number,
    required: true,
  },
  TimePrice: {
    type: Number,
    required: true,
  },
  MaxSpace: {
    type: Number,
    required: true,
  },
});

const Price = mongoose.model("Price", citySchema);

module.exports = Price;