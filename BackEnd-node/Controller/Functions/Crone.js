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
    for await (const ride of rides) {
      await Sockets.NotReactedRide(ride._id);
      if (ride.AssignTime && ride.AssignTime <= Date.now()) {
        console.log("ride 1");
        let driver = GetDriver(ride);
        await Sockets.AssignRide(ride._id, driver._id);
      } else {
        console.log("ride 2");
        await Wait(ride.AssignTime, ride);
      }
    }
  }

  async function Wait(RideAssignedTime, ride) {
    let driver = GetDriver(ride);
    while (RideAssignedTime >= Date.now()) {}
    await Sockets.AssignRide(ride._id, driver._id);
  }

  async function GetDriver(ride) {
    let drivers = await getAvailableDrivers(
      ride.type,
      ride.RideCity,
      ride.RejectedRide
    );
    if (!drivers){
        // let hasDriver = 
    }

    // let driver = drivers.find((driver) => {
    //   !ride.RejectedRide.some((rejectedDriverId) => {
    //     driver._id === rejectedDriverId;
    //   });
    // });

    // if (!driver) {
    //   if(driver.length <= ride.RejectedRide.length)
    //   console.log("No Driver FOund");
    //   return;
    // }
    // return driver;
    return;
  }
};
