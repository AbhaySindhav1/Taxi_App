const express = require("express");
const CreateRide = require("../Model/createRideModel");
const router = new express.Router();
const multer = require("multer");
const upload = multer();
const auth = require("../Controller/middleware/auth");
const mongoose = require("mongoose");
const moment = require("moment");

////                                              ///  ADD Ride ///                                                                   ///

router.post("/Ride", upload.none(), auth, async (req, res) => {
  // console.log(req.body);
  // JSON.parse(req.body.Stops);
  if (!req.body.Stops) {
    req.body.Stops = [];
  }
  try {
    const Ride = new CreateRide(req.body);
    await Ride.save();
    res.status(201).json({
      message: "Ride added",
      code: 51,
      id: Ride._id,
    });
  } catch (error) {
    console.log(error);
    if (error.errors && error.errors.user_id) {
      res.status(400).json("user_id is required");
    } else if (error.errors && error.errors.type) {
      res.status(400).json("type is required");
    } else if (error.errors && error.errors.PickupPoint) {
      res.status(400).json("PickupPoint is required");
    } else if (error.errors && error.errors.DropPoint) {
      res.status(400).json("DropPoint is required");
    } else if (error.errors && error.errors.ScheduleTime) {
      res.status(400).json("BookingTime is required");
    } else if (error.errors && error.errors.TripFee) {
      res.status(400).json("TripFee is required");
    } else {
      res.status(400).json(error);
    }
  }
});

////                                              ///  Get All Ride ///                                                                   ///

router.get("/Ride", async (req, res) => {
  try {
    const Rides = await CreateRide.find({});
    res.status(200).send(Rides);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

////                                              ///  Filter  Ride ///                                                                   ///

router.post("/RideFilter", upload.none(), auth, async (req, res) => {
  let { Search, Status, Type, FromDate, toDate } = req.body;
FromDate  = new Date(FromDate).toISOString()                
toDate  = new Date(toDate).toISOString()                
console.log(FromDate);
  console.log(req.body);

  let Rides;
  try {
    if (mongoose.Types.ObjectId.isValid(Search)) {
      console.log("1");
      Rides = await CreateRide.find({
        $and: [
          { $or: [{ UserName: { $regex: Search } }, { _id: Search }] },
          { Status: Status },
          { type: Type },
          { ScheduleTime: { $gte: new Date(FromDate), $lte: new Date(toDate) } }
        ],
      });
    } else {
      console.log("2");
      Rides = await CreateRide.find({
        $and: [
          { $or: [{ UserName: { $regex: Search } }] },
          { Status: Status },
          { type: Type },
          {
            ScheduleTime: { $gte: new Date(FromDate), $lte: new Date(toDate) },
          },
        ],
      });
    }
    console.log(Rides);
    res.status(200).json(Rides);
  } catch (error) {
    console.log(error);
  }
});

////                                              ///  Edit  Ride ///                                                                   ///

router.patch("/Ride/:id", auth, upload.none(), async (req, res) => {
  let fieldtoupdate = Object.keys(req.body);

  try {
    const Ride = await CreateRide.findById(req.params.id);
    fieldtoupdate.forEach((field) => {
      Ride[field] = req.body[field];
    });
    await Ride.save();
    res.status(200).json("updated");
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

function convertToLocalTime(time) {
  const now = new Date(time);
  const utcNow = moment.utc(now);
  return utcNow.local().format("MM/DD/YYYY, HH:mm:ss");
}

module.exports = router;
