const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const Setting = require("../Model/settingModel");
const multer = require("multer");
const upload = multer();

router.patch("/Setting", auth, upload.none(), async (req, res) => {
  const fieldtoupdate = Object.keys(req.body);

  try {
    let setting = await Setting.findById(req.body.id);

    fieldtoupdate.forEach((field) => {
      setting[field] = req.body[field];
    });

    await setting.save();
    res.status(200).json(setting);
  } catch (error) {}
});

router.get("/Setting", auth, async (req, res) => {
  try {
    let setting = await Setting.find({});

    if (!setting) throw new Error("No settings Found");

    res.status(200).json(setting);
  } catch (error) {
    res.status(400).json("Server Error");
  }
});

module.exports = router;
