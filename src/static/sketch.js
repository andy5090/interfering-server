// let modelIsReady = false;
// // Create a new Sentiment method
// // const sentiment = ml5.sentiment("movieReviews", modelReady);

let score = 0.5;
let painting = false;
let detections = [];

// // // When the model is loaded
// // function modelReady() {
// //   // model is ready
// //   console.log("Model Loaded!");
// //   modelIsReady = true;
// // }

let socket = null;

let slider;

function getSocket() {
  return socket;
}

function initSocket(aSocket) {
  const { events } = window;
  socket = aSocket;
  socket.on("displayScore", function(aScore) {
    score = aScore;
  });
  socket.on("displayPainting", function(aPainting) {
    painting = aPainting;
  });
  socket.on("displayDetections", function(aDetections) {
    detections = aDetections;
  });
}

function preload() {
  socket = io("/");
  initSocket(socket);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(100);
  textAlign(LEFT);

  slider = createSlider(0, 100, 50);
  slider.position(50, 200);
  slider.style("width", "200px");
  slider.id("slider");
  document.getElementById("slider").addEventListener("input", sendValue);
}

function sendValue() {
  getSocket().emit("getSliderValue", slider.value());
}

function draw() {
  background(0);
  textSize(100);
  if (score > 0.55) {
    const extGreen = floor(255 * (1 - score) * 2);
    fill(extGreen, 255, extGreen);
  } else if (score < 0.45) {
    const extRed = floor(255 * score * 2);
    fill(255, extRed, extRed);
  } else {
    fill(255);
  }
  text(score.toFixed(2), 50, 100);

  if (painting) {
    fill(0, 255, 0);
    text("Painting", 400, 100);
  } else {
    fill(255, 0, 0);
    text("Rest", 400, 100);
  }

  textSize(20);
  fill(255);
  let detectIndex = 0;

  detections.map(detected => {
    text(`detection ${detectIndex}`, 400, 200 + detectIndex);
    text(`X : ${detected.detection._box._x}`, 550, 200 + detectIndex);
    text(`detection ${detectIndex}`, 400, 220 + detectIndex);
    text(`X : ${detected.detection._box._y}`, 550, 220 + detectIndex);
    text(`detection ${detectIndex}`, 400, 240 + detectIndex);
    text(`Width : ${detected.detection._box._width}`, 550, 240 + detectIndex);
    text(`detection ${detectIndex}`, 400, 260 + detectIndex);
    text(`Height : ${detected.detection._box._height}`, 550, 260 + detectIndex);

    let emotionIndex = 0;
    let topEmo = "neutral";
    let topEmoValue = 0;
    const emotions = Object.keys(detected.expressions);
    const emotionValues = Object.values(detected.expressions);
    emotions.map(emotion => {
      if (emotionValues[emotionIndex] <= 1) {
        if (emotionValues[emotionIndex] > topEmoValue) {
          topEmoValue = emotionValues[emotionIndex];
          topEmo = emotion.toString();
        }
      }
      emotionIndex++;
    });

    text(`detection ${detectIndex}`, 400, 280 + detectIndex);
    text(`Emotion : ${topEmo} ${topEmoValue}`, 550, 280 + detectIndex);
    detectIndex += 100;
  });
}
