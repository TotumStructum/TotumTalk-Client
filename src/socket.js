import io from "socket.io-client";
import { BASE_URL } from "./config";

let socket = null;

const connectSocket = (token) => {
  if (socket) {
    socket.auth = { token };
    return socket;
  }

  socket = io(BASE_URL, {
    autoConnect: false,
    auth: {
      token,
    },
  });

  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { socket, connectSocket, disconnectSocket };
