let cron = require("node-cron");
let CroneTime = 5;

const { getAvailableDrivers, getUnassignedRequests } = require("./functions");
const Sockets = require("./Socket");

let schedule = `*/${CroneTime} * * * * *`;

module.exports = function (io) {
  cron.schedule(schedule, async () => {
    let rides = await getUnassignedRequests();
    AssignRideToDriver(rides);
  });

  async function AssignRideToDriver(rides) {
    if (!rides) return;
    rides.forEach(async (ride) => {
      if (ride.AssignTime && ride.AssignTime <= Date.now()) {
        let drivers = await getAvailableDrivers(ride.type, ride.RideCity);
        if (drivers.length < 1) return;
        Sockets.AssignRide(ride._id, drivers[0]._id);
        console.log("dsb");
      } else {
        await Wait(ride.AssignTime, ride);
      }
    });
  }

  async function Wait(RideAssignedTime, ride) {
    console.log("waiting",Date.now());
    while (RideAssignedTime >= Date.now()) {}
    console.log("waitied",Date.now());
    let drivers = await getAvailableDrivers(ride.type, ride.RideCity);
    if (drivers.length < 1) return;

    Sockets.AssignRide(ride._id, drivers[0]._id);
  }
};

// const driver = drivers.find((driver) =>
//   driver.rideCity.equals(rideCityObjectId)
// );
