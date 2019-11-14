let score = 0.5;
let painting = false;
let fiction = null;
let detections = [];
let serial1 = null;
let serial2 = null;

let negativeColor;
let positiveColor;

let socket = null;

const textLead = 30;

function initSocket(aSocket) {
  aSocket.on("displayFiction", function(aFiction) {
    fiction = aFiction;
  });
  aSocket.on("displayScore", function(aScore) {
    score = aScore;
  });
  aSocket.on("displayPainting", function(aPainting) {
    painting = aPainting;
  });
  aSocket.on("displayDetections", function(aDetections) {
    detections = aDetections;
  });

  aSocket.on("displaySerial1", function(aSerial1) {
    serial1 = aSerial1;
  });

  aSocket.on("displaySerial2", function(aSerial2) {
    serial2 = aSerial2;
  });
}

let numPoints = 1;
let points = [];

function preload() {
  socket = io("/");
  initSocket(socket);
}

function setup() {
  createCanvas(displayWidth, displayHeight - 470);
  textAlign(LEFT);
  negativeColor = color(220, 10, 50, 100);
  positiveColor = color(50, 100, 200, 100);
}

function draw() {
  background(20);

  const scoreColor = lerpColor(negativeColor, positiveColor, score);

  noFill();
  strokeWeight(150);

  for (let i = 0; i < numPoints; i++) {
    const currentY = height / 2 - floor((score - 0.5) * (height - 100));

    if (i > 0) {
      if (currentY !== points[i - 1].y) {
        const newY = lerp(currentY, points[i - 1].y, 0.95);
        const newColor = lerpColor(points[i - 1].c, scoreColor, 0.1);
        if (points.length <= i) {
          points.push({ x: i, y: newY, c: newColor });
        }
      } else {
        if (points.length <= i) {
          points.push({ x: i, y: currentY, c: scoreColor });
        }
      }
    } else {
      if (points.length <= i) {
        points.push({ x: i, y: currentY, c: scoreColor });
      }
    }
    stroke(points[i].c);
    point(points[i].x, points[i].y);
  }
  if (numPoints < (width / 5) * 3) {
    numPoints += 2;
  } else {
    points = [];
    numPoints = 0;
  }

  noStroke();
  fill(255, 255, 255, 100);
  textSize(50);
  const rectWidth = floor(textWidth("0.00"));
  rect(numPoints, 0, rectWidth, height);

  fill(scoreColor);
  text(nf(score, 1, 2), numPoints, height / 2);
  textSize(20);
  fill(255);
  text("Positive", numPoints, 20);
  text("Negative", numPoints, height - 10);

  const text_X = (width / 5) * 3 + rectWidth;
  let text_Y = textLead;

  text("** The Interfering Status **", text_X, text_Y);
  text_Y += textLead;

  if (fiction !== null) {
    text(`Reading fiction ${fiction}`, text_X, text_Y);
    text_Y += textLead;
  }

  if (painting) {
    text(`Painting zone activated`, text_X, text_Y);
    text_Y += textLead;
  } else {
    text(`Painting zone deactivated`, text_X, text_Y);
    text_Y += textLead;
  }

  if (detections.length > 0) {
    text(`${detections.length} personnel detected`, text_X, text_Y);
    text_Y += textLead;
  }

  if (serial1 !== null) {
    text(`Frame Controller : ${serial1}`, text_X, text_Y);
    text_Y += textLead;
  }

  if (serial1 !== null) {
    text(`Camera Controller : ${serial2}`, text_X, text_Y);
    text_Y += textLead;
  }
}

function mouseClicked() {
  let fs = fullscreen();
  fullscreen(!fs);
}
