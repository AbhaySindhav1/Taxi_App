const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const Settings = require("../../Model/settingModel");

let Crediantials = null;
let oAuth2Client;

async function initializeNodemailer() {
  try {
    if (Crediantials === null) {
      const Setting = await Settings.find({});
      Crediantials = {
        CLIENT_ID: Setting[0].EmailID,
        CLIENT_SECRET: Setting[0].EmailSecret,
        REDIRECT_URI: Setting[0].Redirect_Url,
        REFRESH_TOKEN: Setting[0].EmailToken,
      };
    }

    oAuth2Client = new google.auth.OAuth2(
      Crediantials.CLIENT_ID,
      Crediantials.CLIENT_SECRET,
      Crediantials.REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: Crediantials.REFRESH_TOKEN });
  } catch (error) {
    console.log("initializeNodeMailer", error);
  }
}

async function updateNodemailer() {
  try {
    const Setting = await Settings.find({});
    Crediantials = {
      CLIENT_ID: Setting[0].EmailID,
      CLIENT_SECRET: Setting[0].EmailSecret,
      REDIRECT_URI: Setting[0].Redirect_Url,
      REFRESH_TOKEN: Setting[0].EmailToken,
    };

    oAuth2Client = new google.auth.OAuth2(
      Crediantials.CLIENT_ID,
      Crediantials.CLIENT_SECRET,
      Crediantials.REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: Crediantials.REFRESH_TOKEN });
    // sendMail("abhayabhay202.ar@gmail.com", "update chal raha hai na", "update");
  } catch (error) {
    console.log("updateStripePrivateKey", error);
  }
}

async function sendMail(to, Subject, Text) {
  try {
    await initializeNodemailer();
    const Access_token = await oAuth2Client.getAccessToken();
    const transpost = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "abhaysindhavellu@gmail.com",
        clientId: Crediantials.CLIENT_ID,
        clientSecret: Crediantials.CLIENT_SECRET,
        refreshToken: Crediantials.REFRESH_TOKEN,
        accessToken: Crediantials.Access_token,
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
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// sendMail("abhayabhay202.ar@gmail.com", "kuch nahi", "kya hal chal");

module.exports = { sendMail, updateNodemailer };
