import { join } from "path";
import express from "express";
import socketIO from "socket.io";
import logger from "morgan";
import socketController from "./socketController";
import ejs from "ejs";
import SerialPort from "serialport";
import Readline from "@serialport/parser-readline";

const PORT = 4000;
const app = express();
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", join(__dirname, "views"));
app.use(logger("dev"));
app.use(express.static(join(__dirname, "static")));
app.get("/", (req, res) => res.render("home"));

const handleListening = () =>
  console.log(`✅ Server running: http://localhost:${PORT}`);

const server = app.listen(PORT, handleListening);

const io = socketIO.listen(server);

io.on("connection", socket => {
  const {
    headers: { origin }
  } = socket.client.conn.request;
  console.log(origin, socket.id, "client connected");
  socketController(socket, io);
});

// LINUX SERIAL PORT NAME
// CAMERACON : /dev/ttyACM0
// FRAMECON : /dev/ttyUSB0
export const framePort = new SerialPort("/dev/ttyUSB0", {
  baudRate: 9600
});

export const cameraPort = new SerialPort("/dev/ttyACM0", {
  baudRate: 9600
});

framePort.on("error", err => {
  console.log(err.message);
});

cameraPort.on("error", err => {
  console.log(err.message);
});

const parser1 = new Readline();
framePort.pipe(parser1);
parser1.on("data", data => {
  console.log(data);
  io.emit("displaySerial1", data);
});

const parser2 = new Readline();
cameraPort.pipe(parser2);
parser2.on("data", data => {
  console.log(data);
  io.emit("displaySerial2", data);
});
