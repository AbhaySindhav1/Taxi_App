const jwt = require("jsonwebtoken");
const User = require("../../Model/userModel");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const DecodeUser = jwt.verify(token, "Secret_User_key");

    const user = await User.findOne({
      _id: DecodeUser._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("please auth");
  }
};

module.exports = auth;
