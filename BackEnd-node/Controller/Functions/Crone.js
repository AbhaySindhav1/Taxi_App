let cron = require("node-cron");
let CroneTime = 10;

const {
  getAvailableDrivers,
  getUnassignedRequests,
  getBusyDrivers,
} = require("./functions");
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
      console.log(ride.AssignTime,Date.now());
      if (ride.AssignTime && (ride.AssignTime <= Date.now())) {
        console.log("ride 1");
        console.log("1");
        let driver = await GetDriver(ride);
        console.log("2");
        console.log(driver);

        if (!driver) {
          console.log("3");
          await NoDriverFound(ride);
          console.log("4");
          return;
        }
        console.log("5");
        await Sockets.AssignRide(ride._id, driver._id);
        console.log("6");
      } else {
        console.log("ride 2");
        console.log("21");
        await Wait(ride.AssignTime, ride);
      }
    }
  }

  async function Wait(RideAssignedTime, ride) {
    console.log("22");
    let driver = await GetDriver(ride);
    if (!driver) {
      await NoDriverFound(ride);
      return;
    }

    console.log("25", Date.now());

    while (RideAssignedTime >= Date.now()) {}
    console.log("26", Date.now());
    await Sockets.NotReactedRide(ride._id);
    await Sockets.AssignRide(ride._id, driver._id);
    console.log("27");
  }

  async function GetDriver(ride) {
    console.log("23");
    let drivers = await getAvailableDrivers(
      ride.type,
      ride.RideCity,
      ride.RejectedRide
    );
    console.log("24");
    return drivers;
  }

  async function NoDriverFound(ride) {
    console.log("31");
    let hasBusyDriver = await getBusyDrivers(
      ride.type,
      ride.RideCity,
      ride.RejectedRide
    );
    console.log("32",hasBusyDriver);
    if (hasBusyDriver > 0) {
      console.log("33");
      return;
    } else {
      console.log("34");
      await Sockets.freeRide(ride._id);
      console.log("35");
    }
  }
};
