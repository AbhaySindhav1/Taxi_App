let cron = require("node-cron");
let CroneTime = 5;
const CreateRide = require("../../Model/createRideModel");

let schedule = `*/${CroneTime} * * * * *`;

module.exports = function (io) {
    // cron.schedule(schedule, async () => {
    



    // });
};
