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
      driver = await Driver.findByIdAndUpdate(
        data.driver._id,
        { status: "busy" },
        { new: true }
      );
      io.emit("toSendDriver", { data });
    });

    socket.on("DriverResponse", async (data) => {
      try {
        let ride = await Ride.findByIdAndUpdate(data.id, { new: true });
        if (data.response === "Accepted") {
          ride.Status = "Accepted";
          ride.Driver = driver.DriverName;

          await driver.save();
          await ride.save();
        } else if (data.response === "Declined") {
          driver.status = "online";
          ride.Status = "pending";
          ride.Driver = null;
          await driver.save();
          await ride.save();
        }
        console.log(driver);
        console.log(ride);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
