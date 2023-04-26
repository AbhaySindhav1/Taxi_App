const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    unique:true
  },
  zone: {
    type: Array,
    required: true,
  },
});
const City = mongoose.model("Zone", citySchema);

module.exports = City;
