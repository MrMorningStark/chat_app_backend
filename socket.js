const { SOCKET_ON } = require("./constant");

const activeChatRooms = {};

const socket = () => {
    global.io.on('connection', (socket) => {

        socket.on(SOCKET_ON.INITIATE_CHAT, (roomId) => {
            console.log('s')
            console.log("initiate chat", roomId)
            // if (!activeChatRooms.includes(roomId)) {
            //     activeChatRooms.push(roomId);
            // }
            if (!activeChatRooms[roomId]) {
                activeChatRooms[roomId] = 1;
            } else {
                activeChatRooms[roomId] = 2
            }
            // Join the room
            socket.join(roomId);
            socket.to(roomId).emit(SOCKET_ON.CHAT_INITIATED, roomId);

        });

        socket.on(SOCKET_ON.MESSAGE_RECEIVED, ({ roomID, user, status }) => {
            // Broadcast the message to all clients in the room
            console.log("message RECIEVED => ", roomID)
            socket.to(roomID).emit(SOCKET_ON.MESSAGE_RECEIVED, { roomID, user, status });
        });

        socket.on(SOCKET_ON.SEND_MESSAGE, ({ roomID, user, message, unReadMessages }) => {
            // Broadcast the message to all clients in the room
            console.log(roomID)
            console.log("message => ", message)
            socket.to(roomID).emit(SOCKET_ON.RECEIVE_MESSAGE, { roomID, user, message, unReadMessages, isOnline: activeChatRooms[roomID] == 2 });
        });

        // Handler for leaving the chat room
        socket.on(SOCKET_ON.LEAVE_CHAT, ({ roomId }) => {

            // Remove the room from the activeRooms object
            // delete activeChatRooms[roomId];
            if (activeChatRooms[roomId] == 2) {
                activeChatRooms[roomId] = 1
            } else {
                delete activeChatRooms[roomId];
            }
            socket.leave(roomId);

            // Notify other users in the room that a user has left
            socket.to(roomId).emit('user_left', { roomId });
        });

    })
}



module.exports = { socket };