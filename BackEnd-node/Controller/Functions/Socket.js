const Driver = require("../../Model/driverModel");
const Rides = require("../../Model/createRideModel");

const { getAvailableDrivers } = require("./functions");

const { default: mongoose } = require("mongoose");

const users = {};
function getTime() {
  return new Date().getTime() + 20000;
}

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
        await CancelRide(data.Ride._id, data.Ride.DriverId);
      } else if (data.Status == 1) {
        await NotReactedRide(data.Ride._id, data.Status);
      }
      if (data.Status == 2) {
        await AcceptRide(data.Ride._id, data.Ride.DriverId, data.Status);
      }
    });

    socket.on("RideAssignNearestDriver", async (RideID) => {
      try {
        let ride = await Rides.findById(RideID);
        let driver = await getAvailableDrivers(
          ride.type,
          ride.RideCity,
          ride.RejectedRide
        );
        if (!driver) return;
        await AssignRide(RideID, driver._id);
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
    rides.AssignTime = getTime();
    console.log("ridetime", rides.AssignTime);
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
      if (!ride) return;

      if (mongoose.Types.ObjectId.isValid(ride?.DriverId)) {
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
        ride.AssignTime = getTime();
        ride.RejectedRide.push(FoundDriver._id);
        await ride.save();

        let rides = await GetRideDetail(RideID);
        io.emit("NotReactedRide", {
          rides,
          Driver: { DriverID: FoundDriver._id, Status: FoundDriver.status },
          from: "NotReactedRide function emit",
        });
      } else {
        let rides = await GetRideDetail(RideID);
        io.emit("NotReactedRide", {
          rides,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  module.exports.NotReactedRide = NotReactedRide;

  ///////////////////////////////////////////////////////////////       Free  Ride          //////////////////////////////////////////////////////////////////////

  freeRide = async (RideID) => {
    console.log("free Ride");
    try {
      let ride = await Rides.findById(RideID);
      // console.log("free Ride 1 ", ride);
      if (mongoose.Types.ObjectId.isValid(ride.DriverId)) {
        console.log("free Ride 2");
        let FoundDriver = await Driver.findByIdAndUpdate(
          ride.DriverId,
          { status: "online" },
          { new: true }
        );
        console.log("free Ride 3");

        ride.Status = 1;
        ride.DriverId = null;
        ride.Driver = null;
        ride.RideStatus = "Assigned";
        ride.RejectedRide = [];
        ride.AssignTime = null;
        await ride.save();
        console.log("free Ride 4");


        ride = await GetRideDetail(ride._id);
        console.log("free Ride 6");
        io.emit("noDriverFound", {
          ride,
          Driver: { DriverID: FoundDriver._id, Status: FoundDriver.status },
        });
      } else {
        console.log("free Ride 22");
        ride.Status = 1;
        ride.RideStatus = "Assigned";
        ride.RejectedRide = [];
        ride.AssignTime = null;
        console.log("free Ride 23");

        await ride.save();
        console.log("free Ride 24");
        ride = await GetRideDetail(ride._id);
        console.log("free Ride 25");
        io.emit("noDriverFound", {
          ride,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  module.exports.freeRide = freeRide;

  ///////////////////////////////////////////////////////////////       Get  FUll  Ride          //////////////////////////////////////////////////////////////////////

  async function GetRideDetail(ID) {
    console.log("Id,", ID);
    const ride = await Rides.aggregate([
      {
        $match: {
          _id: ID,
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
        $unwind: {
          path: "$DriverInfo",
          preserveNullAndEmptyArrays: true,
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
      },
    ]);

    return ride[0];
  }
};
