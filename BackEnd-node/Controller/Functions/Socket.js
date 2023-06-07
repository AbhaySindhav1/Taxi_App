const Driver = require("../../Model/driverModel");
const Rides = require("../../Model/createRideModel");

const { getAvailableDrivers } = require("./functions");

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
      console.log(data);
      if (!data) return;
      if (data.Status == 0) {
        console.log(data);
        CancelRide(data.rideID, data.driverID);
      }
      if (data.Status == "Assign") {
        AssignRide(data.rideID, data.driverID);
      }
    });

    socket.on("DriverResponse", async (data) => {
      if (!data) return;
      if (data.Status == 0) {
        console.log(data);
        CancelRide(data.Ride._id, data.Ride.DriverId);
      } else if (data.Status == 1) {
        NotReactedRide(data.Ride._id, data.Status);
      }
      if (data.Status == 2) {
        AcceptRide(data.Ride._id, data.Ride.DriverId, data.Status);
      }
    });

    socket.on("RideAssignNearestDriver", async (RideID) => {
      try {
        let ride = await Rides.findById(RideID);
        let drivers = await getAvailableDrivers(ride.type, ride.RideCity);
        if (!drivers.length > 0) return;
        await AssignRide(RideID, drivers[0]._id);
      } catch (error) {
        console.log(error);
      }
    });
  });

  /////////////////////////////////////////////////////////////       Assign Driver to  Ride    ////////////////////////////////////////////////////////////////////////

  AssignRide = async (RideID, AsDriverID) => {
    let rides = await Rides.findById(RideID);

    if (rides.Status != 1 && rides.Status != 100) return;

    let AssignDriver = await Driver.findById(AsDriverID);
    if (!AssignDriver) return;
    AssignDriver.status = "onRequest";
    await AssignDriver.save();

    rides.Status = 100;
    rides.DriverId = new mongoose.Types.ObjectId(AssignDriver._id);
    rides.Driver = AssignDriver.DriverName;
    rides.AssignTime = Date.now() + 20000;
    await rides.save();

    if (!rides) return;

    rides = await GetRideDetail(rides._id);

    io.emit("reqtoSendDriver", rides);
  };

  module.exports.AssignRide = AssignRide;

  /////////////////////////////////////////////////////////////        Driver Accepted  Ride    ////////////////////////////////////////////////////////////////////////

  AcceptRide = async (RideID, DriverID, Status) => {
    if (!RideID) return;
    if (!mongoose.Types.ObjectId.isValid(DriverID)) return;
    let AssignDriver = await Driver.findByIdAndUpdate(
      DriverID,
      { status: "busy" },
      { new: true }
    );
    let ride = await Rides.findByIdAndUpdate(RideID, {
      Status: Status,
      DriverId: new mongoose.Types.ObjectId(DriverID),
      Driver: AssignDriver.DriverName,
    });

    let FullRideDetail = await GetRideDetail(ride._id);

    io.emit("ReqAcceptedByDriver", FullRideDetail);
  };

  module.exports.AcceptRide = AcceptRide;

  ///////////////////////////////////////////////////////////////       Cancel Ride          //////////////////////////////////////////////////////////////////////

  CancelRide = async (RideID, DriverID) => {
    try {
      let ride = await Rides.findByIdAndUpdate(RideID, {
        Status: 0,
      });

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
      console.log(ride);
    } catch (error) {
      console.log(error);
    }
  };

  module.exports.CancelRide = CancelRide;

  ///////////////////////////////////////////////////////////////       Not Reject  Ride          //////////////////////////////////////////////////////////////////////

  NotReactedRide = async (RideID) => {
    try {
      let ride = await Rides.findById(RideID);

      if (mongoose.Types.ObjectId.isValid(ride.DriverId)) {
        let FoundDriver = await Driver.findByIdAndUpdate(
          ride.DriverId,
          { status: "online" },
          { new: true }
        );

        ride.Status = 100;
        ride.DriverId = null;
        ride.Driver = null;
        ride.RideStatus = "Assigned";
        ride.RejectedRide.push(FoundDriver._id);
        await ride.save();

        ride = await GetRideDetail(ride._id);
        io.emit("NotReactedRide", {
          ride,
          Driver: { DriverID: FoundDriver._id, Status: FoundDriver.status },
        });
      } else {
        ride = await GetRideDetail(ride._id);
        io.emit("NotReactedRide", {
          ride,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  module.exports.NotReactedRide = NotReactedRide;

  ///////////////////////////////////////////////////////////////       Get  FUll  Ride          //////////////////////////////////////////////////////////////////////

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
        $unwind: "$DriverInfo",
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
    return ride[0];
  }
};
