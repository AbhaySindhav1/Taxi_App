const Driver = require("../../Model/driverModel");
const Rides = require("../../Model/createRideModel");
const { default: mongoose } = require("mongoose");

const users = {};
let driver;

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
        CancelRide(data.ride);
      }
      if (data.Status == "Assign") {
        AssignRide(data.ride, data.driver);
      }
     
      //   io.emit("UpdateDriverStatus", driver);
      //   io.emit("toSendDriver", { ride, driver });
      // }
    });

    socket.on("DriverResponse", async (data) => {
      try {
        let ride = await Ride.findByIdAndUpdate(data.id, { new: true });
        if (data.response === "Accepted") {
          ride.Status = "Accepted";
          ride.Driver = driver.DriverName;
          ride.DriverId = driver._id;
          await driver.save();
          await ride.save();
          io.emit("AssignedReqAccepted", {
            id: ride._id,
            Status: "Accepted",
            Driver: driver.DriverName,
          });
        } else if (data.response === "Declined") {
          driver.status = "online";
          ride.Status = "pending";
          ride.Driver = null;
          await driver.save();
          await ride.save();
          io.emit("AssignedReqDeclined", {
            id: ride._id,
            Status: ride.Status,
            Driver: "Assigning",
          });
          io.emit("UpdateDriverStatus", driver);
        }
      } catch (error) {
        console.log(error);
      }
    });
  });

  /////////////////////////////////////////////////////////////       Assign Driver to  Ride    ////////////////////////////////////////////////////////////////////////

  AssignRide = async (Ride, AsDriver) => {
    if (Ride.Status != 1) return;
    let ride = await Rides.findById(Ride._id);
    let AssignDriver = await Driver.findByIdAndUpdate(
      AsDriver,
      { status: "busy" },
      { new: true }
    );

    Ride.Status = 100;
    ride.Status = 100;
    ride.DriverId = new mongoose.Types.ObjectId(AssignDriver._id);
    ride.Driver = AssignDriver.DriverName;
    await ride.save();

    io.emit("toSendDriver", { Ride, AssignDriver });
  };

  ///////////////////////////////////////////////////////////////       Cancel Ride          //////////////////////////////////////////////////////////////////////

  CancelRide = async (Ride) => {
    let ride = await Rides.findByIdAndUpdate(
      Ride._id,
      { Status: 0 },
      { new: true }
    );
    if (mongoose.Types.ObjectId.isValid(Ride.DriverId)) {
      let FoundDriver = await Driver.findByIdAndUpdate(
        Ride.DriverId,
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
