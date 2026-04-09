import io from "socket.io-client";

let socket;

const connectSocket = (token) => {
  socket = io("http://localhost:3000", {
    auth: {
      token,
    },
  });
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { socket, connectSocket, disconnectSocket };
