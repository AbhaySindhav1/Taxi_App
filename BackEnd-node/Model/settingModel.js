const mongoose = require("mongoose");


const SettingSchema = mongoose.Schema({
    country: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
});

const Setting = mongoose.model("Setting", SettingSchema);

module.exports = Setting;