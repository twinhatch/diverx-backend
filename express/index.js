const apps = require("express")();
require("dotenv").config();
const passport = require("passport");
const bodyParser = require("body-parser");
const noc = require("no-console");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(apps);
const io = socketIo(server);
const mongoose = require("mongoose");


// Bootstrap schemas, models
require("./bootstrap");

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  socket.emit('updatedId', socket.id)
  socket.on('join', async (data) => {
    socket.join(data)
    io.to(data).emit('joined-user', socket.id)
  })

  socket.on('joinadmin', () => {
    socket.join('admin');
  })

  socket.on("chatuser", async (data) => {
    const Support = mongoose.model("Support");

    const getAllChat = await Support.find().populate("userId", "-password")
      .sort({ updatedAt: -1, 'userId.completedDelivery': -1 });

    socket.emit("userlist", getAllChat);
  });

  socket.on("getsupportMessages", async (data) => {
    const SupportChat = mongoose.model("SupportChat");
    const getAllChat = await SupportChat.find(data)
      .populate("sender receiver connection", "-password")
      .sort({ createdAt: -1 });

    socket.emit("messages", getAllChat);
  });

  socket.on('onsupport', (u) => {
    console.log('onsupport===>', u)
    io.emit("updateConnection", {});
  })

  socket.on("createSupportMessage", async (data) => {
    console.log(data)
    const SupportChat = mongoose.model("SupportChat");
    const Support = mongoose.model("Support");
    const chat = new SupportChat(data);
    await chat.save();
    const con = await Support.findOne({ support_id: data.support_id })
    const getAllChat = await SupportChat.find({ support_id: data.support_id })
      .populate("sender receiver connection", "-password")
      .sort({ createdAt: -1 });
    console.log(con)
    if (con.satisfied && data.userId) {
      io.to(data.support_id).emit("allmessages", getAllChat);
      io.emit("updateConnection", {});
      // socket.emit('updateConnection')
      con.satisfied = false;
      await con.save()
    } else {
      io.to(data.support_id).emit("allmessages", getAllChat);
    }

    socket.emit("messages", getAllChat);
  });

  socket.on("satisfied", async (data) => {
    const SupportChat = mongoose.model("SupportChat");
    const Support = mongoose.model("Support");
    const chat = new SupportChat(data);
    await chat.save();
    const con = await Support.findOne({ support_id: data.support_id })
    con.satisfied = data.type || false;
    await con.save()
    const getAllChat = await SupportChat.find({ support_id: data.support_id })
      .populate("sender receiver connection", "-password")
      .sort({ createdAt: -1 });
    console.log(con)
    io.to(data.support_id).emit("allmessages", getAllChat);
    io.emit("updateConnection", {});
    socket.emit("messages", getAllChat);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });




});
// App configuration
noc(apps);
apps.use(bodyParser.json());
apps.use(passport.initialize());
apps.use(cors());

//Database connection
require("./db");
//Passport configuration
require("./passport")(passport);
//Routes configuration
require("./../src/routes")(apps);
const app = server;
module.exports = app;
