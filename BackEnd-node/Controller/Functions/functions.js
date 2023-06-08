const CreateRide = require("../../Model/createRideModel");
const Driver = require("../../Model/driverModel");

async function getUnassignedRequests() {
  try {
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
      },
      {
        $match: {
          Status: { $in: [100] },
        },
      },
      {
        $sort: {
          AssignTime: 1,
        },
      },
    ]);
    return rides;
  } catch (error) {
    console.log(error);
  }
}

async function getAvailableDrivers(VehicleType, RideCity,excludedDriverIds) {
  try {
    const pipeline = [
      {
        $match: {
          $and: [
            { approval: "Approve" },
            { status: "online" },
            { ServiceType: VehicleType },
            { DriverCity: RideCity },
            { _id: { $nin: excludedDriverIds } }
          ],
        },
      },
    ];
console.log("sdjhdsih");
    let drivers = await Driver.aggregate(pipeline);
console.log(drivers.length);
    return drivers[0];
  } catch (error) {
    console.log(error);
  }
}
async function getBusyDrivers(VehicleType, RideCity,excludedDriverIds) {
  try {
    const pipeline = [
      {
        $match: {
          $and: [
            { approval: "Approve" },
            { status: "onRequest" },
            { ServiceType: VehicleType },
            { DriverCity: RideCity },
            { _id: { $nin: excludedDriverIds } }
          ],
        },
      },
    ];
    let drivers = await Driver.aggregate(pipeline);

    console.log("busyDriverlength",drivers.length);
    return drivers.length;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getAvailableDrivers,
  getUnassignedRequests,
  getBusyDrivers
};
