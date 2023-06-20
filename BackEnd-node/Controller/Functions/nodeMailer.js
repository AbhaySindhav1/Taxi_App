const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");
const envPath = path.join(__dirname, "../../key.env");
console.log(envPath);
require("dotenv").config({ path: envPath });

const CLIENT_ID = process.env.EmailID;
const CLIENT_SECRET = process.env.EmailSecret;
const REDIRECT_URI = process.env.Redirect_Url;
const REFRESH_TOKEN = process.env.EmailToken;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(to, Subject, Text) {
  console.log(to, Subject, Text);
  try {
    const Access_token = await oAuth2Client.getAccessToken();
    const transpost = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "abhaysindhavellu@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: Access_token,
      },
    });

    const mailOption = {
      from: "Abhay Sindhav <abhaysindhavellu@gmail.com>",
      to: to,
      subject: Subject,
      text: Text,
      //   html: "<h1 style='background-color: #6d7ae0;'>Ho jaya</h1>",
    };

    const result = await transpost.sendMail(mailOption);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = { sendMail };
