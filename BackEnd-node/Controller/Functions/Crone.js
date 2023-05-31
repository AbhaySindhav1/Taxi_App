let cron = require("node-cron");
let CroneTime = 3;
const CreateRide = require("../../Model/createRideModel");
const driver = require("../../Model/createRideModel");

let schedule = `*/${CroneTime} * * * * *`;

module.exports = function (io) {
  cron.schedule(schedule, async () => {
    let drivers = await driver.find({ status: "online" });
   let Rides = await CreateRide.find({Status:1})
  });
};
