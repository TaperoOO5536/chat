const messageForm = document.querySelector("#messageForm");
const messagesDiv = document.querySelector("#messagesDiv");
const messageInput = document.querySelector("#messageInput");
const usersListDiv = document.querySelector("#usersListDiv");
import { colors } from "./colors.js";

let userName = prompt("Как вас зовут");
const colorNameList = Object.keys(colors);
const randomIndex = Math.floor(Math.random() * colorNameList.length);
const userColor = colors[colorNameList[randomIndex]];
// let userColor =
// "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
socket.emit("userJoin", { name: userName, color: userColor });

function addUserToList(name, id) {
  let userInListP = document.createElement("p");
  userInListP.classList.add("userInList");
  userInListP.innerText = name;
  userInListP.id = id;
  usersListDiv.append(userInListP);
}

function appendServerMessage(message) {
  const messageFromServerP = document.createElement("p");
  messageFromServerP.classList.add("messageFromServer");
  messageFromServerP.innerText = message;
  messagesDiv.append(messageFromServerP);
}

function appendUserMessage(message, color, name) {
  const newMessageP = document.createElement("p");
  const userNameP = document.createElement("p");
  newMessageP.classList.add("message");
  newMessageP.style.color = color;
  userNameP.classList.add("userName");
  newMessageP.innerText = message;
  userNameP.innerText = `${name}:`;
  if (name == "Вы") {
    newMessageP.classList.add("sendedMessage");
    userNameP.classList.add("myUserName");
  } else {
    newMessageP.classList.add("gotMessage");
    userNameP.classList.add("otherUserName");
  }
  messagesDiv.append(userNameP, newMessageP);
}

socket.on("helloToUser", (users) => {
  let message = "Добро пожаловать. ";
  if (users.length == 0) {
    message += "Вы первый в чате.";
  } else {
    let usersList = "";
    users.forEach((user) => {
      usersList += `${user.name}, `;
      addUserToList(user.name, user.id);
    });
    usersList = usersList.slice(0, -2);
    message += `В чате уже присутствуют: ${usersList}.`;
  }
  addUserToList(userName, socket.id);
  appendServerMessage(message);
});

socket.on("newUserHello", (user) => {
  addUserToList(user.name, user.id);
  let message = `К нам присоеденился ${user.name}`;
  appendServerMessage(message);
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let message = messageInput.value;
  messageInput.value = "";
  appendUserMessage(message, userColor, "Вы");
  socket.emit("sendMessage", message);
});

socket.on("userLeft", (user) => {
  console.log(user.name);
  let message = `${user.name} нас покинул`;
  appendServerMessage(message);
  let discntUserInListP = document.querySelector(`#${user.id}`);
  discntUserInListP.remove();
});

socket.on("message", (message) => {
  appendUserMessage(message.message, message.color, message.name);
});
