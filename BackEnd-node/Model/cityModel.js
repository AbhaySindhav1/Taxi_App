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
  Location: {
    type:  Object,
  },
});
const City = mongoose.model("Zone", citySchema);

module.exports = City;

citySchema.index({Location : '2dsphere' });