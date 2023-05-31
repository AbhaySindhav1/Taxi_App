const mongoose = require("mongoose");


const SettingSchema = mongoose.Schema({
    ReqCronTime: {
        type: Number,
        required: true,
        default:30
      },
    RideStops: {
        type: Number,
        required: true,
        default:1
      },
});

const Setting = mongoose.model("Setting", SettingSchema);

module.exports = Setting;