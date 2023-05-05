const express = require("express");
const CreateRide = require("../Model/createRideModel");
const router = new express.Router();
const multer = require("multer");
const upload = multer();
const auth = require("../Controller/middleware/auth");

////                                              ///  ADD Ride ///                                                                   ///

router.post("/Ride", upload.none(), auth, async (req, res) => {
  JSON.parse(req.body.Stops);
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

////                                              ///  Get  Ride ///                                                                   ///

router.post("/RideDetail", upload.none(), auth, async (req, res) => {
  const { Search, Status, Type, fromDate, toDate } =
    req.body;

  let query = {};

  if (searchQuery) {
    query.$or = [
      { UserName: { $regex: searchQuery, $options: "i" } },
      { phone: { $regex: searchQuery, $options: "i" } },
      { id: { $regex: searchQuery, $options: "i" } },
    ];
  }

  if (filterStatus) {
    query.status = filterStatus;
  }

  if (filterVehicle) {
    query.vehicle = filterVehicle;
  }

  if (fromDate && toDate) {
    query.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

 await CreateRide.find(query, (err, requests) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(requests);
    }
  });
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

module.exports = router;
