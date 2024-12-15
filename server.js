import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Server } from "socket.io";
import { workerData } from "node:worker_threads";
const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname + "/public"));

app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/index.html`);
});

let users = [];

function findUser(id) {
  let user = users.find((user) => {
    return user.id === id;
  });
  return user;
}

io.sockets.on("connection", (client) => {
  console.log("К нам присоеденился:");
  client.on("sendMessage", (data) => {
    let user = findUser(client.id);
    client.broadcast.emit("message", {
      message: data,
      name: user.name,
      color: user.color,
    });
    console.log(`Пользователь ${user.name} отправил сообщение: ${workerData}`);
  });

  client.on("userJoin", (user) => {
    client.emit("helloToUser", users);
    client.broadcast.emit("newUserHello", { name: user.name, id: client.id });
    users.push({ id: client.id, name: user.name, color: user.color });
    condole.log(user.name);
  });

  client.on("disconnect", () => {
    console.log(client.id);
    let user = findUser(client.id);
    users = users.filter((user) => user.id !== client.id);
    io.sockets.emit("userLeft", { name: user.name, id: client.id });
    console.log(`Пользователь ${user.name} отключился`);
  });
});

server.listen(3000);
