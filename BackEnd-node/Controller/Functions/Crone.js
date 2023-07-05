let cron = require("node-cron");
let CroneTime = 10;
let ReqVar;

const {
  getAvailableDrivers,
  getUnassignedRequests,
  getBusyDrivers,
} = require("./functions");
const Sockets = require("./Socket");

let schedule = `*/${CroneTime} * * * * *`;

module.exports = function (io) {
  cron.schedule(schedule, async () => {
    try {
      let rides = await getUnassignedRequests();
      AssignRideToDriver(rides);
    } catch (error) {}
  });

  async function AssignRideToDriver(rides) {
    if (!rides) return;
    for await (const ride of rides) {
      // ReqVar = 1;
      await CheckTimeOut(ride);
    }
  }

  async function CheckTimeOut(ride) {
    async function CheckTime(ride) {
      if (ride.AssignTime && ride.AssignTime <= Date.now()) {
        // ReqVar++;
        // if (ReqVar == 2) {
        await AssignDriverToRide(ride);
        // }
      } else {
        setImmediate(() => CheckTime(ride));
      }
    }
   await CheckTime(ride);
  }

  async function GetDriver(ride) {
    let drivers = await getAvailableDrivers(
      ride.type,
      ride.RideCity,
      ride.RejectedRide
    );
    return drivers;
  }

  async function NoDriverFound(ride) {
    let hasBusyDriver = await getBusyDrivers(
      ride.type,
      ride.RideCity,
      ride.RejectedRide
    );
    return hasBusyDriver;
  }

  async function AssignDriverToRide(ride) {
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
      }
    } else {
      await Sockets.AssignRide(ride._id, newdriver._id);
    }
  }
};
