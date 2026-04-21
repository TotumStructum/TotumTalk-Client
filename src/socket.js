import io from "socket.io-client";

let socket = null;

const connectSocket = (token) => {
  if (socket) {
    socket.auth = { token };
    return socket;
  }

  socket = io("http://localhost:3000", {
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
