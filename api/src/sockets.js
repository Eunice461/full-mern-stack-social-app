function listen(io){
    io.on("connection", (socket) => {
        console.log("Connected to socket.io");
        socket.on("setup", (userData) => {
          socket.join(userData._id);
          socket.emit("connected");
        });

        let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, content }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      content,
    });
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
    })
  }
      
//         socket.on("join chat", (room) => {
//           socket.join(room);
//           console.log("User Joined Room: " + room);
//         });
//         socket.on("typing", (room) => socket.in(room).emit("typing"));
//         socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
      
//         socket.on("new message", (newMessageRecieved) => {
//            chat = newMessageRecieved.chat;
      
//           if (!chat.users) return console.log("chat.users not defined");
      
//           chat.users.forEach((user) => {
//             if (user._id == newMessageRecieved.sender._id) return;
      
//             socket.in(user._id).emit("message recieved", newMessageRecieved);
//           });
//         });
      
//         socket.off("setup", () => {
//           console.log("USER DISCONNECTED");
//           socket.leave(userData._id);
//         });
        
//         socket.on("disconnect", (reason) => {
//             console.log(`USER DISCONNECTED ${socket.id} disconnect: ${reason}`);
//             socket.leave(userData._id);
//           });
//       });
// }

module.exports = {
    listen,
}