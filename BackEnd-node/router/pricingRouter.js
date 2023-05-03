const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const { handleUpload } = require("../Controller/middleware/multer");
const Price = require("../Model/pricingModel");

/////////////////////////////////////////////////////////          Add Pricing         ////////////////////////////////////////////////////////////////////////////////////

router.post("/price", handleUpload, auth, async (req, res) => {
  try {
    if (
      !req.body.country ||
      req.body.country === "undefined" ||
      req.body.country === "null"
    ) {
      console.log("Country Is Required");
      throw new Error("Country Is Required");
    } else if (
      !req.body.city ||
      req.body.city === "undefined" ||
      req.body.city === "null"
    ) {
      console.log("City Is Required");
      throw new Error("City Is Required");
    } else if (
      !req.body.type ||
      req.body.type === "undefined" ||
      req.body.type === "null"
    ) {
      console.log("Country Is Required");
      throw new Error("Type Is Required");
    }
    const existingModel = await Price.findOne({
      country: req.body.country,
      city: req.body.city,
      type: req.body.type,
    });
    if (existingModel) {
      return res.status(400).send({
        code: 39,
        message: "A model with these details already exists",
      });
    }

    const price = new Price(req.body);
    await price.save();
    res
      .status(200)
      .json({ massage: "price for this zone is created", id: price._id });
  } catch (error) {
    res.status(400).json(error);
  }
});

/////////////////////////////////////////////////////////          Edit Zone Pricing        ////////////////////////////////////////////////////////////////////////////////////

router.patch("/price/:id", auth, handleUpload, async (req, res) => {
  const fieldtoupdate = Object.keys(req.body);

  try {
    const price = await Price.findById(req.params.id);

    fieldtoupdate.forEach((field) => {
      price[field] = req.body[field];
    });

    const existingModel = await Price.findOne({
      country: price.country,
      city: price.city,
      type: price.type,
    });

    if (existingModel) {
      return res.status(400).send({
        code: 39,
        message: "A model with these details already exists",
      });
    }

    await price.save();
    res
      .status(200)
      .json({ massage: "price for this zone is Edited", id: price._id });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

/////////////////////////////////////////////////////////          Get All Zone Vehicles        ////////////////////////////////////////////////////////////////////////////////////

router.get("/price/Vehicle", handleUpload, auth, async (req, res) => {
  const searchQuery = req.query.Value || "";
  const regext = new RegExp(searchQuery, "i");
  try {
    const Vehicles = await Price.find({
      $or: [{ city: regext }],
    }).distinct("type");
    res.status(200).send(Vehicles);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/price/pricing", handleUpload, auth, async (req, res) => {
  try {
    const priceing = await Price.find({
      $and: [
        { city: { $regex: req.body.city } },
        { type: { $regex: req.body.type } },
      ],
    });
    res.status(200).send(priceing);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Get All Zone  Pricing        ////////////////////////////////////////////////////////////////////////////////////

router.get("/price", handleUpload, auth, async (req, res) => {
  const searchQuery = req.query.Value || "";
  const regext = new RegExp(searchQuery, "i");
  try {
    const prices = await Price.find({
      $or: [{ country: regext }, { city: regext }, { type: regext }],
    });
    res.status(200).send(prices);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Delete Pricing        ////////////////////////////////////////////////////////////////////////////////////

router.delete("/price/:id", auth, async (req, res) => {
  try {
    const price = await Price.findByIdAndDelete(req.params.id);
    if (!price) {
      return new Error("Zone Prices not Found");
    }
    res.status(200).send(price);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
