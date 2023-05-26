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
        CancelRide(data.rideID,data.driverID);
      }
      if (data.Status == "Assign") {
        AssignRide(data.rideID, data.driverID);
      }
    });

    socket.on("DriverResponse", async (data) => {
      console.log(data);
      if (!data) return;
      if (data.Status == 0) {
        CancelRide(data.Ride._id,data.Ride.DriverId);
      } else if (data.Status == 1) {
        console.log(data);
        NotReactedRide(data.Ride,data.Status)
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
    let ride = await Rides.findById(Ride._id, {
      Status: 2,
      DriverId: new mongoose.Types.ObjectId(DriverID),
      Driver: AssignDriver.DriverName,
    });
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
    let ride = await Rides.findByIdAndUpdate(
      RideID,
      { Status: 0 },
      { new: true }
    );
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
  };
};

///////////////////////////////////////////////////////////////       Not Reject  Ride          //////////////////////////////////////////////////////////////////////

NotReactedRide = async (Ride, RideStatus) => {
  console.log(Ride);
  let ride = await Rides.findByIdAndUpdate(
    Ride._id,
    { Status: 1, DriverId: null, Driver: null },
    { new: true }
  );
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
};
