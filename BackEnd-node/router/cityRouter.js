const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const { handleUpload } = require("../Controller/middleware/multer");
const City = require("../Model/cityModel");
const mongoose = require("mongoose");
const { Types } = require("mongoose");

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

    console.log(req.body.country);
    console.log(Types.ObjectId.isValid(req.body.country));

    const city = new City({
      country: new mongoose.Types.ObjectId(req.body.country),
      city: req.body.city,
      zone: JSON.parse(req.body.zone),
      Location: JSON.parse(req.body.Location),
    });
    await city.save();
    res.status(200).json({
      message: "City added",
      code: 21,
      id: city._id,
    });
  } catch (error) {
    console.log(error);
    if (error.errors && error.errors.city.kind === "required") {
      res.status(400).json("City Is Required");
    } else if (error.errors && error.errors.country.kind === "required") {
      res.status(400).json("Country Is Required");
    } else if (error.keyPattern && error.keyPattern.city) {
      res.status(400).json(error.keyValue.city + " " + "is Already Registered");
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
    // const cities = await City.find({
    //   $or: [{ country: regext }, { city: regext }],
    // });
    const cities = await City.aggregate([
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "countryInfo",
        },
      },
    ]);
    res.status(200).send(cities);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Get Cities using CountryId        ////////////////////////////////////////////////////////////////////////////////////

router.get("/CityCountry", auth, async (req, res) => {
  const searchQuery = req.query.Value || "";
if(searchQuery){
  searchQuery.trim()
}
  try {
    const cities = await City.find({
      $or: [{ country: new mongoose.Types.ObjectId(searchQuery) }],
    })
      .select("_id city")

    res.status(200).send(cities);
  } catch (error) {
    res.status(400).send(error);
  }
});
/////////////////////////////////////////////////////////          Get zONES         ////////////////////////////////////////////////////////////////////////////////////

router.get("/CityCountryZone", auth, async (req, res) => {
  // const searchQuery = req.query.Value || "";
  // const regext = new RegExp(searchQuery, "i");
  try {
    const Zones = await City.find({}).select("-_id zone").distinct("zone");
    res.status(200).send(Zones);
  } catch (error) {
    res.status(400).send(error);
  }
});
/////////////////////////////////////////////////////////          Get Check Zone         ////////////////////////////////////////////////////////////////////////////////////

router.get("/CityCordinates", auth, async (req, res) => {
  try {
    const Cord = await City.find({
      city: req.query.city,
      Location: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [
              +req.query.loc.split(",")[0],
              +req.query.loc.split(",")[1],
            ],
          },
        },
      },
    });
    res.status(200).send(Cord);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Edit  County         ////////////////////////////////////////////////////////////////////////////////////

router.patch("/city/:id", auth, handleUpload, async (req, res) => {
  if (req.body.zone) {
    req.body.zone = JSON.parse(req.body.zone);
  }
  if (req.body.Location) {
    req.body.Location = JSON.parse(req.body.Location);
  }

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
