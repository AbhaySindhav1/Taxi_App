const mongoose = require("mongoose");
const moment = require("moment");

const RideSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  PickupPoint: {
    type: String,
    required: true,
  },
  DropPoint: {
    type: String,
    required: true,
  },
  Stops: {
    type: String,
    // default: [],
    required:true
  },
  ScheduleTime: {
    type: String,
    required: true,
  },
  BookingTime: {
    type: String,
    default: () => {
      const now = new Date();
      const utcNow = moment.utc(now);

      const localTimeStr = utcNow.local().format("MM/DD/YYYY, HH:mm:ss");
      return localTimeStr;
    },
    required: true,
  },
  TripFee: {
    type: String,
    required: true,
  },
  Driver: {
    type: mongoose.Types.ObjectId,
    default: null,
  },
  Status: {
    type: String,
    default: "pending",
  },
});
const CreateRide = mongoose.model("Ride", RideSchema);

module.exports = CreateRide;
