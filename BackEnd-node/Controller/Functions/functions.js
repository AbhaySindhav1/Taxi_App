const CreateRide = require("../../Model/createRideModel");
const Driver = require("../../Model/driverModel");
const path = require("path")
const envPath = path.join(__dirname, "../key.env");
require("dotenv").config({ path: envPath });
const accountSid = process.env.smsID;
const authToken = process.env.smsToken;

const client = require("twilio")(accountSid, authToken);

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

async function getAvailableDrivers(VehicleType, RideCity, excludedDriverIds) {
  try {
    const pipeline = [
      {
        $match: {
          $and: [
            { approval: "Approve" },
            { status: "online" },
            { ServiceType: VehicleType },
            { DriverCity: RideCity },
            { _id: { $nin: excludedDriverIds } },
          ],
        },
      },
    ];

    let drivers = await Driver.aggregate(pipeline);

    return drivers[0];
  } catch (error) {
    console.log(error);
  }
}
async function getBusyDrivers(VehicleType, RideCity, excludedDriverIds) {
  try {
    const pipeline = [
      {
        $match: {
          $and: [
            { approval: "Approve" },
            { status: "onRequest" },
            { ServiceType: VehicleType },
            { DriverCity: RideCity },
            { _id: { $nin: excludedDriverIds } },
          ],
        },
      },
    ];
    let drivers = await Driver.aggregate(pipeline);

    console.log("busyDriverlength", drivers.length);
    return drivers;
  } catch (error) {
    console.log(error);
  }
}

async function sendMessages(
  message,
  from = "+13613153908",
  to = "+916355032160"
) {
  client.messages
    .create({
      body: message,
      from: from,
      to: to,
    })
    .then((message) => console.log(message.sid));
}


module.exports = {
  getAvailableDrivers,
  getUnassignedRequests,
  getBusyDrivers,
  sendMessages
};
