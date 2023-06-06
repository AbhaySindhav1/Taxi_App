let time = 1;

const interval = setInterval(() => {
  time++;
  console.log(time);
}, 1000);

const checkTime = () => {
  if (time < 5) {
    setTimeout(checkTime, 1000);
  } else {
    clearInterval(interval);
    console.log("45");
  }
};

checkTime();