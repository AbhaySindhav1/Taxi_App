let cron = require("node-cron");
let CroneTime = 10;
const { getAvailableDrivers, getUnassignedRequests } = require("./functions");
const { AssignRide } = require("./Socket");

let schedule = `*/${CroneTime} * * * * *`;

module.exports = function (io) {
  cron.schedule(schedule, async () => {
    let rides = await getUnassignedRequests();
    if (!rides) return;
    let drivers = await getAvailableDrivers();
    rides.forEach((ride)=>{
      const driver = drivers.find((driver) =>
      driver.rideCity.equals(rideCityObjectId)
    );
    })
  });
};
