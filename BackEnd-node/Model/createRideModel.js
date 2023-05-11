const mongoose = require("mongoose");
const moment = require("moment");

const RideSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  UserName: {
    type: String,
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
    required: true,
  },
  Distance: {
    type: String,
    required: true,
  },
  Time: {
    type: String,
    required: true,
  },
  ScheduleTime: {
    type: Date,
    required: true,
    set: function (value) {
      return new Date(value).toISOString();
    },
  },
  BookingTime: {
    type: Date,
    default: () => {
      return new Date().toISOString();
    },
    required: true,
  },
  TripFee: {
    type: String,
    required: true,
  },
  Driver: {
    type: mongoose.Schema.Types.Mixed,
    default: 'Driver',
    validate: {
      validator: function(v) {
        return typeof v === 'string' || mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid ObjectId or String!`
    }
  },
  Status: {
    type: String,
    default: "pending",
  },
});
const CreateRide = mongoose.model("Ride", RideSchema);

module.exports = CreateRide;
