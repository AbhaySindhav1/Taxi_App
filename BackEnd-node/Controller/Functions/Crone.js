let cron = require("node-cron");
let CroneTime = 30;
const CreateRide = require("../../Model/createRideModel");

const interval = 6;
let schedule = `*/${interval} * * * * *`;

module.exports = function (io) {
    // cron.schedule(schedule, async () => {
    //   console.log("10");
    // });
};

//sk_test_51N93JqGPole4IExICnz9ZdhWYJVFis60b1B1R83OibSPoWksuWHuRGlep1Sd3eAzWrqagpaJVRzDTWRgNOvzOauP00IK98cVhT    secret

//   sk_test_51N93JqGPole4IExICnz9ZdhWYJVFis60b1B1R83OibSPoWksuWHuRGlep1Sd3eAzWrqagpaJVRzDTWRgNOvzOauP00IK98cVhT