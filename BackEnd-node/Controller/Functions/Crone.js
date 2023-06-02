let cron = require("node-cron");
let CroneTime = 10;
const CreateRide = require("../../Model/createRideModel");
const Driver = require("../../Model/driverModel");

let schedule = `*/${CroneTime} * * * * *`;

module.exports = function (io) {
  cron.schedule(schedule, async () => {
    // const rides = await getUnassignedRequests();
    const drivers = await getAvailableDriver();
  });

  async function getUnassignedRequests() {
    const rides = await CreateRide.aggregate([
      {
        $lookup: {
          from: "myusers",
          localField: "user_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
        preserveNullAndEmptyArrays: true
      },
      {
        $lookup: {
          from: "taxis",
          localField: "type",
          foreignField: "_id",
          as: "VehicleInfo",
        },
      },
      {
        $unwind: "$VehicleInfo",
        preserveNullAndEmptyArrays: true
      },
      {
        $match: {
          Status: { $in: [1] },
        },
      },
    ]);
    return rides;
  }

  async function getAvailableDriver() {
    try {
      let Drivers = await Driver.aggregate([
        {
          $match: {
            $and: [{ approval: "Approve" }, { status: "online" }],
          },
        },
        {
          $lookup: {
            from: "taxis",
            localField: "type",
            foreignField: "_id",
            as: "VehicleInfo",
          },
        },
        {
          $unwind: "$VehicleInfo",
          preserveNullAndEmptyArrays: true,
        },
      ]);

      console.log(Drivers.length);
    } catch (error) {}
  }
};
