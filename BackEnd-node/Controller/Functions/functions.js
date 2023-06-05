const CreateRide = require("../../Model/createRideModel");
const Driver = require("../../Model/driverModel");

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
      preserveNullAndEmptyArrays: true,
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
    {
      $match: {
        Status: { $in: [100] },
      },
    },
  ]);
  return rides;
}

async function getAvailableDrivers() {
  try {
    const pipeline = [
      {
        $match: {
          $and: [{ approval: "Approve" }, { status: "online" }],
        },
      },
    ];

    let drivers = await Driver.aggregate(pipeline);

    return drivers;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getAvailableDrivers,
  getUnassignedRequests,
};
