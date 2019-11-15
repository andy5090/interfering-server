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
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT);
  negativeColor = color(220, 10, 50, 100);
  positiveColor = color(50, 100, 200, 100);
}

function draw() {
  background(20);

  const scoreColor = lerpColor(negativeColor, positiveColor, score);
  
  noStroke();

  for (let i = 0; i < numPoints; i++) {
    const currentY = height / 2 - floor((score - 0.5) * height);

    if (i > 0) {
      if (currentY !== points[i - 1].y) {
        const newY = lerp(currentY, points[i - 1].y, 0.9);
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
    fill(points[i].c);
    if(points[i].y < height / 2)
      rect(points[i].x, points[i].y, 1, height/2 - points[i].y);
    else 
      rect(points[i].x, height / 2, 1, points[i].y - height / 2);
  }
  if (numPoints < (width / 2)) {
    numPoints+=2;
  } else {
    points = [];
    numPoints = 0;
  }

  
  
  fill(255, 255, 255, 100);
  rect(numPoints, 0, 2, height);

  textAlign(RIGHT);
  textSize(30);
  fill(255);
  text(nf(score, 1, 2), numPoints, height / 2 + 15);
  textSize(15);
  fill(255);
  text("Positive", numPoints + 2, 10);
  text("Negative", numPoints + 2, height - 5);

  const text_X = (width / 2);
  let text_Y = textLead;

  textAlign(LEFT);

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

// function mouseClicked() {
//   let fs = fullscreen();
//   fullscreen(!fs);
// }
