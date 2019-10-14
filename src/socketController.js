import events from "./events";
import { comPort } from "./server";

const socketController = (socket, io) => {
  //const broadcast = (event, data) => socket.broadcast.emit(event, data);
  //const superBroadcast = (event, data) => io.emit(event, data);

  socket.on(events.getSentimentScore, score => {
    io.emit("displayScore", score);

    // const motorSpeed = Math.floor(score * 100);
    // if (motorSpeed > 10) comPort.write(`${motorSpeed}\n`);
  });

  socket.on(events.getPaintStatus, painting => {
    io.emit("displayPainting", painting);
  });

  socket.on(events.getDetections, detections => {
    io.emit("displayDetections", detections);
  });

  socket.on(events.getSliderValue, value => {
    comPort.write(`${value}\n`);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
};

export default socketController;
