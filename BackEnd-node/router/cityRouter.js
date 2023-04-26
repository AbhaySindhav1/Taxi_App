const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const {handleUpload} = require("../Controller/middleware/multer");
const City = require("../Model/cityModel");

/////////////////////////////////////////////////////////          Add City         ////////////////////////////////////////////////////////////////////////////////////

router.post("/city", handleUpload, auth, async (req, res) => {
  try {
    if (req.body.country === "undefined") {
      throw new Error("Country Is Required");
    } else if (req.body.city === "undefined") {
      throw new Error("City Is Required");
    } else if (req.body.zone === "undefined") {
      throw new Error("Zone Is Required");
    }

    let city = new City(req.body);
    await city.save();
    res.status(200).json({
      message: "City added",
      code: 21,
      id: city._id,
    });
  } catch (error) {
    if (error.errors && error.errors.city.kind === "required") {
      res.status(400).json("City Is Required");
    } else if (error.errors && error.errors.country.kind === "required") {
      res.status(400).json("Country Is Required");
    } else if (error.errors && error.errors.keyPattern.city) {
      res.status(400).json("city is Used");
    } else if (error.errors && error.errors.zone.kind === "required") {
      res.status(400).json("Zone Is Required");
    } else {
      res.status(400).send(error.toString());
    }
  }
});

/////////////////////////////////////////////////////////          Get City         ////////////////////////////////////////////////////////////////////////////////////

router.get("/Cities", auth, async (req, res) => {
  const searchQuery = req.query.Value || "";
  const regext = new RegExp(searchQuery, "i");

  try {
    const cities = await City.find({
      $or: [{ country: regext }, { city: regext }],
    });
    res.status(200).send(cities);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Get Cities         ////////////////////////////////////////////////////////////////////////////////////

router.get("/CityCountry", auth, async (req, res) => {
  const searchQuery = req.query.Value || "";
  const regext = new RegExp(searchQuery, "i");
  try {
    const cities = await City.find({
      $or: [{ country: regext }],
    }).select("-_id city").distinct('city');
    res.status(200).send(cities);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Edit  County         ////////////////////////////////////////////////////////////////////////////////////

router.patch("/city/:id", auth, handleUpload, async (req, res) => {
  const fieldtoupdate = Object.keys(req.body);
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      throw new Error("city not found");
    }
    fieldtoupdate.forEach((field) => {
      city[field] = req.body[field];
    });

    await city.save();
    res.status(200).json({
      message: "City Edited",
      code: 22,
      id: city._id,
    });
  } catch (error) {
    if (error.errors && error.errors.city.kind === "required") {
      res.status(400).json("City Is Required");
    } else if (error.errors && error.errors.country.kind === "required") {
      res.status(400).json("Country Is Required");
    } else if (error.errors && error.errors.zone.kind === "required") {
      res.status(400).json("Zone Is Required");
    } else {
      res.status(400).send(error.toString());
    }
  }
});

//                                                        //   Delete   Country  //                                                                          //


router.delete("/city/:id", auth, async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) {
      return new Error("city not Found");
    }
    res.status(200).send(city);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
