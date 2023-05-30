const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const Setting = require("../Model/settingModel");
const mongoose = require("mongoose");
const { Types } = require("mongoose");

router.post("/Setting", auth, async (req, res) => {});

module.exports = router;
