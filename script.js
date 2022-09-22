var peer;
var connected;
var stream;
var receivedVideo = document.getElementById("recv");
var logs = document.getElementById("logs");
var curStatus = document.getElementById("status");
var idInput = document.getElementById("streamName").value;
var currentConnection;
var lineCount = 0;
var peers = [];
var displayMediaOptions = {
  video: {
    cursor: "always",
    frameRate: 60,
  },
  audio: {
    autoGainControl: false,
    channelCount: 2,
    echoCancellation: false,
    latency: 0,
    noiseSuppression: false,
    sampleRate: 48000,
    sampleSize: 16,
    volume: 1.0,
  },
};

setCookie("lineCount", "0");

async function createChannel(channelID) {
  channelID = channelID.replace(/[^a-zA-Z0-9]/g, "_");
  stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  receivedVideo.srcObject = stream;
  peer = new Peer(channelID);
  peer.on("open", function(id) {
    console.log("Channel " + id + " has been opened.");
    logs.innerHTML =
      logs.innerHTML + "Channel " + id + " has been opened." + "<br>";
    curStatus.innerHTML = "Status: Ready";
  });
  peer.on("connection", function(conn) {
    connected = conn.peer;
    peers.push(conn);
    console.log(
      "User with client ID " + connected + " is viewing the channel."
    );
    logs.innerHTML =
      logs.innerHTML + "A new user is viewing the channel." + "<br>";
    conn.on("data", function(data) {
      console.log("Data received: " + data);
      logs.innerHTML = logs.innerHTML + "Data received: " + data + "<br>"
      if (data == "stream connect") {
        peer.call(connected, stream);
      } else if (data == "stream exists") {
        console.log("Returning True");
        conn.send("True");
      } else {
        sendAll(data);
      }
    });
  });
}

function sendAll(message) {
  for (var i in peers) {
    peers[i].send(message);
  }
}


function connectChannel(channelID) {
  peer = new Peer();
  peer.on("open", function(id) {
    var conn = peer.connect(channelID);
    currentConnection = conn;
    conn.on("open", function() {
      console.log(
        "Connected to channel " + channelID + " with client ID " + id
      );
      conn.on("data", function(data) {
        if (data == "source change") {
          reconnectStream();
        } else {
          logChat(data);
        }
      });
      conn.send("stream connect");
    });
    conn.on("disconnected", function() {
      reconnectStream();
    });
  });
  peer.on("call", function(call) {
    call.answer();
    call.on("stream", function(stream) {
      receivedVideo.srcObject = stream;
    });
    call.on("error", function(e) {
      reconnectStream();
    });
    call.on("disconnected", function() {
      reconnectStream();
    });
  });
  peer.on("disconnected", function() {
    reconnectStream();
  });
}

function logChat(message) {
  var chatLogs = document.getElementById("chat");
  if (parseInt(getCookie("lineCount")) > 10) {
    chatLogs.innerHTML = "";
    setCookie("lineCount", "0");
  }
  if (getCookie("previousMessage").trim() != message.trim()) {
    setCookie("previousMessage", message);
    chatLogs.innerHTML = chatLogs.innerHTML + message + "<br>";
    setCookie("lineCount", String(parseInt(getCookie("lineCount")) + 1));
  }
}

function sendMessage(message) {
  currentConnection.send(message);
}

function startStream() {
  closeModal("streamDetails");
  idInput = document.getElementById("streamName").value;
  createChannel(idInput);
}


function viewStream() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  connectChannel(urlParams.get("channelId"));
}

function reconnectStream() {
  peer.destroy();
  viewStream();
}

function promptUsername() {
  if (getCookie("isUser") != "true") {
    userInput = prompt("What should we call you?");
    if (userInput.trim() != "") {
      setCookie("userName", userInput.trim());
      setCookie("isUser", "true");
    } else {
      userInput();
    }
  }
}

function setCookie(cname, cvalue) {
  const today = new Date();
  const d = new Date();
  d.setTime(today.getTime() + 3600000 * 24 * 15);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/; SameSite=Lax";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function sanitizeString(str) {
  str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
  return str.trim();
}