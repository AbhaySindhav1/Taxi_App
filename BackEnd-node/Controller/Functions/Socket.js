const Driver = require("../../Model/driverModel");
const Rides = require("../../Model/createRideModel");
const { default: mongoose } = require("mongoose");

const users = {};

module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("login", (userId) => {
      console.log(userId);
      users[userId] = socket.id;
      console.log(users);
    });

    socket.on("ride", async (data) => {
      if (!data) return;
      if (data.Status == 0) {
        CancelRide(data.rideID, data.driverID);
      }
      if (data.Status == "Assign") {
        AssignRide(data.rideID, data.driverID);
      }
    });

    socket.on("DriverResponse", async (data) => {
      console.log(data);
      if (!data) return;
      if (data.Status == 0) {
        CancelRide(data.Ride._id, data.Ride.DriverId);
      } else if (data.Status == 1) {
        console.log(data);
        NotReactedRide(data.Ride, data.Status);
      }
      if (data.Status == 2) {
        AcceptRide(data.Ride, data.Ride.DriverId, data.Status);
      }
    });
  });

  /////////////////////////////////////////////////////////////        Driver Accepted  Ride    ////////////////////////////////////////////////////////////////////////

  AcceptRide = async (Ride, DriverID, Status) => {
    if (!Ride) return;
    if (!mongoose.Types.ObjectId.isValid(DriverID)) return;
    let AssignDriver = await Driver.findByIdAndUpdate(
      DriverID,
      { status: "busy" },
      { new: true }
    );
    // let ride = await Rides.findById(Ride._id, {
    //   Status: 2,
    //   DriverId: new mongoose.Types.ObjectId(DriverID),
    //   Driver: AssignDriver.DriverName,
    // });

    let ride = await GetRideDetail(Ride._id);
    ride.Status = 2;
    ride.DriverId = new mongoose.Types.ObjectId(DriverID);
    ride.Driver = AssignDriver.DriverName;
    await ride.save();

    Ride.Status = Status;
    Ride.DriverId = ride.DriverId;
    Ride.Driver = ride.Driver;

    io.emit("ReqAcceptedByDriver", { Ride, AssignDriver });
  };

  /////////////////////////////////////////////////////////////       Assign Driver to  Ride    ////////////////////////////////////////////////////////////////////////

  AssignRide = async (RideID, AsDriverID) => {
    let ride = await Rides.findById(RideID);
    if (ride.Status != 1) return;

    let AssignDriver = await Driver.findByIdAndUpdate(
      AsDriverID,
      { status: "busy" },
      { new: true }
    );

    ride.Status = 100;
    ride.DriverId = new mongoose.Types.ObjectId(AssignDriver._id);
    ride.Driver = AssignDriver.DriverName;
    await ride.save();

    io.emit("reqtoSendDriver", {
      ride,
      Driver: { DriverID: AssignDriver._id, Status: AssignDriver.status },
    });
  };

  ///////////////////////////////////////////////////////////////       Cancel Ride          //////////////////////////////////////////////////////////////////////

  CancelRide = async (RideID, DriverID) => {
    try {
      let ride = await GetRideDetail(RideID);
      ride.Status = 0;
      await ride.save();

      if (mongoose.Types.ObjectId.isValid(ride.DriverId)) {
        let FoundDriver = await Driver.findByIdAndUpdate(
          DriverID,
          { status: "online" },
          { new: true }
        );
        io.emit("CancelledRide", {
          Ride: { Status: ride.Status, RideId: ride._id },
          Driver: { DriverID: FoundDriver._id, Status: FoundDriver.status },
        });
      } else {
        io.emit("CancelledRide", {
          Ride: { Status: ride.Status, RideId: ride._id },
        });
      }
    } catch (error) {}
  };
};

///////////////////////////////////////////////////////////////       Not Reject  Ride          //////////////////////////////////////////////////////////////////////

NotReactedRide = async (Ride, RideStatus) => {
  console.log(Ride);
  try {
    let ride = await GetRideDetail(Ride._id);
    ride.Status = 1;
    ride.DriverId = null;
    ride.Driver = none;
    await ride.save();

    if (mongoose.Types.ObjectId.isValid(Ride.DriverId)) {
      let FoundDriver = await Driver.findByIdAndUpdate(
        Ride.DriverId,
        { status: "online" },
        { new: true }
      );
      io.emit("NotReactedRide", {
        ride,
        Driver: { DriverID: FoundDriver._id, Status: FoundDriver.status },
      });
    } else {
      io.emit("NotReactedRide", {
        ride,
      });
    }
  } catch (error) {}
};

async function GetRideDetail(ID) {
  const ride = await Rides.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(ID),
      },
    },
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
        from: "drivers",
        localField: "DriverId",
        foreignField: "_id",
        as: "DriverInfo",
      },
    },
    {
      $unwind: "$VehicleInfo",
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
  ]);
  return ride;
}
