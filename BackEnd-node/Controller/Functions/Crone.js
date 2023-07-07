let cron = require("node-cron");
let variable;

const {
  getAvailableDrivers,
  getUnassignedRequests,
  getBusyDrivers,
  CheckRide,
  CheckFirstRide,
} = require("./functions");
const Sockets = require("./Socket");

module.exports = function (io) {
  cron.schedule(`*/10 * * * * *`, async () => {
    try {
      let rides = await getUnassignedRequests();
      await AssignRideToDriver(rides);
    } catch (error) {}
  });

  async function AssignRideToDriver(rides) {
    if (!rides) return;
    for await (const ride of rides) {
      variable = 1;
      await CheckTimeOut(ride);
    }
  }

  async function CheckTimeOut(ride) {
    async function CheckTime(ride) {
      if (ride.AssignTime && ride.AssignTime <= Date.now()) {
        let checks = await CheckFirstRide(ride._id);
        if (!checks) return;
        await AssignDriverToRide(ride);
      } else {
        setImmediate(async () => await CheckTime(ride));
      }
    }
    if (variable == 1) {
      await CheckTime(ride);
      ++variable;
    }
  }

  async function GetDriver(ride) {
    console.log("GetDriver");
    let drivers = await getAvailableDrivers(
      ride.type,
      ride.RideCity,
      ride.RejectedRide
    );
    return drivers;
  }

  async function NoDriverFound(ride) {
    console.log("NoDriverFound");
    let hasBusyDriver = await getBusyDrivers(
      ride.type,
      ride.RideCity,
      ride.RejectedRide
    );
    return hasBusyDriver;
  }

  async function AssignDriverToRide(ride) {
    console.log("AssignDriverToRide");
    if (ride.AssigningType == "single") {
      await Sockets.freeRide(ride._id);
      return;
    }
    await Sockets.NotReactedRide(ride._id);
    let newdriver = await GetDriver(ride);
    if (!newdriver) {
      let busydriver = await NoDriverFound(ride);
      if (busydriver.length >= 1) {
        return;
      } else {
        await Sockets.freeRide(ride._id);
        console.log("freeRide");
      }
    } else {
      // let Check = await CheckRide(ride._id);
      // console.log(Check);
      // if (Check) {
      //   console.log("Check");
      //   await Sockets.AssignRide(ride._id, newdriver._id);
      // }
    }
  }
};
