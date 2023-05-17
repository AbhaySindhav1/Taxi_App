const Driver = require("../../Model/driverModel");
const Ride = require("../../Model/createRideModel");

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
      console.log(data);
      if (data.Status === "Cancelled") {
        console.log(data);
      } else if (data.Status === "Assign") {
        let ride = data.ride;
        driver = await Driver.findByIdAndUpdate(
          data.driver,
          { status: "busy" },
          { new: true }
        );
        io.emit("UpdateDriverStatus", driver);
        io.emit("toSendDriver", { ride, driver });
      }
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
};
