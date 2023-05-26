const express = require("express");
const CreateRide = require("../Model/createRideModel");
const Driver = require("../Model/driverModel");
const router = new express.Router();
const multer = require("multer");
const upload = multer();
const auth = require("../Controller/middleware/auth");
const mongoose = require("mongoose");
const moment = require("moment");

////                                              ///  ADD Ride ///                                                                   ///

router.post("/Ride", upload.none(), auth, async (req, res) => {
  if (!req.body.Stops) {
    req.body.Stops = [];
  }
  if (req.body.type) {
    if (!mongoose.Types.ObjectId.isValid(req.body.type)) {
      throw new Error("Vehicle Not Valid");
    }
    req.body.type = new mongoose.Types.ObjectId(req.body.type);
  }
  if (req.body.RideCity) {
    if (!mongoose.Types.ObjectId.isValid(req.body.RideCity)) {
      throw new Error("Services Not Found");
    }
    req.body.RideCity = new mongoose.Types.ObjectId(req.body.RideCity);
  }
  req.body.ScheduleTime = moment(
    req.body.ScheduleTime,
    "DD/MM/YYYY, HH:mm:ss"
  ).format("YYYY-MM-DDTHH:mm:ssZZ");

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
      res.status(400).json("ScheduleTime is required");
    } else if (error.errors && error.errors.TripFee) {
      res.status(400).json("TripFee is required");
    } else {
      res.status(400).json(error);
    }
  }
});

////                                              ///  Get All Pending And Assigning Ride ///                                                                   ///

router.get("/Ride", async (req, res) => {
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
          Status: { $in: [1, 2, 100] },
        },
      },
    ]);
    res.status(200).send(rides);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

////                                              ///  Get All Assignd and Other Ride ///                                                                   ///

router.get("/Ride/Assigned", async (req, res) => {
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
    ]);
    res.status(200).send(rides);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

////                                              ///  Filter  Ride ///                                                                   ///

router.post("/RideFilter", upload.none(), auth, async (req, res) => {
  let { Search, Status, Type, FromDate, toDate } = req.body;

  console.log(req.body);

  try {
    let Rides = await CreateRide.aggregate([
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
          $and: [
            Search && Search !== "null"
              ? mongoose.Types.ObjectId.isValid(Search)
                ? { user_id: new mongoose.Types.ObjectId(Search) }
                : { UserName: { $regex: Search, $options: "i" } }
              : {},

            Status && Status !== "null" ? { Status: +Status } : {},
            FromDate && toDate !== "null"
              ? {
                  ScheduleTime: {
                    $gte: new Date(FromDate),
                    $lte: new Date(toDate),
                  },
                }
              : {},
            Type && mongoose.Types.ObjectId.isValid(Type)
              ? { type: new mongoose.Types.ObjectId(Type) }
              : {},
          ],
        },
      },
    ]);

    res.status(200).json(Rides);
  } catch (error) {
    console.log(error);
  }
});

////                                              ///  Edit  Ride ///                                                                   ///

// router.patch("/Ride/:id", auth, upload.none(), async (req, res) => {
//   let fieldtoupdate = Object.keys(req.body);
//   if ((req.body.DriverId === "undefined") | null | "null" | "") {
//     req.body.DriverId = null;
//   } else if (
//     req.body.DriverId &&
//     !mongoose.Types.ObjectId.isValid(req.body.DriverId)
//   ) {
//   }

//   try {
//     const Ride = await CreateRide.findById(req.params.id);
//     // const driver = await Driver.findByIdAndUpdate(
//     //   { _id: req.body.DriverId },
//     //   { status: "online" },
//     //   { new: true }
//     // );
//     fieldtoupdate.forEach((field) => {
//       Ride[field] = req.body[field];
//     });
//     await Ride.save();
//     res.status(200).json({ change: "updated", Ride });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json(error);
//   }
// });

////                                              ///  Ride History   ///                                                                   ///

// router.get("/Ride/History", async (req, res) => {
//   try {
//     const Rides = await CreateRide.find({
//       $or: [{ Status: 0 }, { Status: 6 }],
//     });
//     res.status(200).send(Rides);
//   } catch (error) {
//     console.log(error);
//     res.status(400).send(error);
//   }
// });

module.exports = router;
