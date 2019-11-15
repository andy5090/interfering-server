import { framePort, cameraPort } from "./server";

const socketController = (socket, io) => {
  //const broadcast = (event, data) => socket.broadcast.emit(event, data);
  //const superBroadcast = (event, data) => io.emit(event, data);

  let detectionCounter = 0;
  let nonDetectedTime = new Date().getTime();
  let prePainting = false;
  let sideMovement = 0;
  let topMovement = 0;
  let scoreQueue = [];
  let scoreAvg = 0.5;
  let currentEmotion = "neutral";
  let emotionMagnitude = 1;

  socket.on("getSentimentScore", score => {
    io.emit("displayScore", score);

    if (scoreQueue.length < 5) scoreQueue.push(score);
    else {
      scoreQueue.shift();
      scoreQueue.push(score);
    }

    let tempScore = 0;
    let index = 0;
    scoreQueue.map(score => {
      tempScore += score;
      index++;
    });
    scoreAvg = tempScore / index;
  });
  socket.on("fictionName", fiction => {
    const nameOnly = fiction.split(".")[0];
    io.emit("displayFiction", nameOnly);
  });

  socket.on("getPaintStatus", painting => {
    io.emit("displayPainting", painting);

    if (prePainting !== painting) {
      if (painting && !movementStart) {
        movementCnt++;
        if (movementCnt > 3) {
          framePort.write("HV");
          movementStart = true;
          movementCnt = 0;
        }
      }
      if (!painting) {
        framePort.write("HV");
      }
    }
  });

  let movementStart = false;
  let movementCnt = 0;

  socket.on("wristPosition", wrist => {
    if (movementStart) {
      const vertMotion = sideMovement - wrist.side_Y;
      const HoriMotion = topMovement - wrist.top_Y;

      if (vertMotion < -10) {
        console.log("Down");
        if (scoreAvg < 0.5) {
          if (scoreAvg < 0.2) {
            framePort.write("U");
            setTimeout(() => {
              framePort.write("V");
            }, 800 * emotionMagnitude);
          } else {
            framePort.write("U");
            setTimeout(() => {
              framePort.write("V");
            }, 500 * emotionMagnitude);
          }
        } else {
          if (scoreAvg > 0.8) {
            framePort.write("D");
            setTimeout(() => {
              framePort.write("V");
            }, 500 * emotionMagnitude);
          } else {
            framePort.write("D");
            setTimeout(() => {
              framePort.write("V");
            }, 300 * emotionMagnitude);
          }
        }
      } else if (vertMotion > 10) {
        console.log("Up");
        if (scoreAvg < 0.5) {
          if (scoreAvg < 0.2) {
            framePort.write("D");
            setTimeout(() => {
              framePort.write("V");
            }, 500 * emotionMagnitude);
          } else {
            framePort.write("D");
            setTimeout(() => {
              framePort.write("V");
            }, 300 * emotionMagnitude);
          }
        } else {
          if (scoreAvg > 0.8) {
            framePort.write("U");
            setTimeout(() => {
              framePort.write("V");
            }, 800 * emotionMagnitude);
          } else {
            framePort.write("U");
            setTimeout(() => {
              framePort.write("V");
            }, 500 * emotionMagnitude);
          }
        }
      }

      if (HoriMotion < -10) {
        console.log("Right");
        if (scoreAvg < 0.5) {
          if (scoreAvg < 0.2) {
            framePort.write("Q");
          } else {
            framePort.write("S");
          }
          framePort.write("L");
          setTimeout(() => {
            framePort.write("H");
          }, 700 * emotionMagnitude);
        } else {
          if (scoreAvg > 0.8) {
            framePort.write("Q");
          } else {
            framePort.write("S");
          }
          framePort.write("R");
          setTimeout(() => {
            framePort.write("H");
          }, 500 * emotionMagnitude);
        }
      } else if (HoriMotion > 10) {
        console.log("Left");
        if (scoreAvg < 0.5) {
          if (scoreAvg < 0.2) {
            framePort.write("Q");
          } else {
            framePort.write("S");
          }
          framePort.write("R");
          setTimeout(() => {
            framePort.write("H");
          }, 500 * emotionMagnitude);
        } else {
          if (scoreAvg > 0.8) {
            framePort.write("Q");
          } else {
            framePort.write("S");
          }
          framePort.write("L");
          setTimeout(() => {
            framePort.write("H");
          }, 700 * emotionMagnitude);
        }
      }

      sideMovement = wrist.side_Y;
      topMovement = wrist.top_Y;

      movementStart = false;
    }
  });

  socket.on("watchingEmotion", emotion => {
    currentEmotion = emotion;
    switch (currentEmotion) {
      case "angry":
        emotionMagnitude = 2;
        break;
      case "surprised":
        emotionMagnitude = 1.5;
        break;
      case "happy":
        emotionMagnitude = 1.2;
        break;
      case "neutral":
        emotionMagnitude = 1;
        break;
      case "disgusted":
        emotionMagnitude = 0.9;
        break;
      case "sad":
        emotionMagnitude = 0.7;
        break;
      case "fearful":
        emotionMagnitude = 0.5;
        break;
    }
  });

  socket.on("getDetections", detections => {
    io.emit("displayDetections", detections);

    if (detections.length > 0) {
      nonDetectedTime = new Date().getTime();
      const maxWidth = detections[0].detection._imageDims._width;
      const maxHeight = detections[0].detection._imageDims._height;

      const faceX =
        detections[0].detection._box._x +
        detections[0].detection._box._width / 2;
      // const faceY =
      //   detections[0].detection._box._y +
      //   detections[0].detection._box._height / 2;

      const faceSize = detections[0].detection._box._height;

      if (detectionCounter === 0) {
        if (faceX < maxWidth / 3) {
          cameraPort.write("L");
          setTimeout(() => {
            cameraPort.write("S");
          }, 80);
        } else if (faceX > (maxWidth / 3) * 2) {
          cameraPort.write("R");
          setTimeout(() => {
            cameraPort.write("S");
          }, 80);
        } else cameraPort.write("S");
        if (faceSize < maxHeight * 0.4) {
          cameraPort.write("I");
          setTimeout(() => {
            cameraPort.write("Z");
          }, 150);
        } else if (faceSize >= maxHeight * 0.7) {
          cameraPort.write("Z");
        } else if (faceSize > maxHeight * 0.5) {
          cameraPort.write("O");
          setTimeout(() => {
            cameraPort.write("Z");
          }, 150);
        }
      }
      detectionCounter++;
      if (detectionCounter === 5) detectionCounter = 0;
    } else if (detections.length === 0) {
      const timeNow = new Date().getTime();
      if (timeNow - nonDetectedTime > 900000) {
        nonDetectedTime = new Date().getTime();
        cameraPort.write("I");
        setTimeout(() => {
          cameraPort.write("Z");
          setTimeout(() => {
            cameraPort.write("O");
            setTimeout(() => {
              cameraPort.write("Z");
              setTimeout(() => {
                cameraPort.write("L");
                setTimeout(() => {
                  cameraPort.write("S");
                  setTimeout(() => {
                    cameraPort.write("R");
                    setTimeout(() => {
                      cameraPort.write("S");
                    }, 700);
                  }, 2000);
                }, 600);
              }, 3000);
            }, 1000);
          }, 3000);
        }, 1000);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "client disconnected");
  });
  0;
};

export default socketController;
