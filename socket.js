const { SOCKET_ON } = require("./constant");

const activeChatRooms = [];

const socket = () => {
    global.io.on('connection', (socket) => {

        socket.on(SOCKET_ON.INITIATE_CHAT, (roomId) => {
            console.log('s')
            console.log("initiate chat", roomId)
            if (!activeChatRooms.includes(roomId)) {
                activeChatRooms.push(roomId);
            }

            // Join the room
            socket.join(roomId);
            socket.to(roomId).emit(SOCKET_ON.CHAT_INITIATED, roomId);

        });

        socket.on(SOCKET_ON.SEND_MESSAGE, ({ roomID, user, message }) => {
            // Broadcast the message to all clients in the room
            console.log("message => ", message)
            socket.to(roomID).emit(SOCKET_ON.RECEIVE_MESSAGE, { roomID, user, message });
        });

        // Handler for leaving the chat room
        socket.on(SOCKET_ON.LEAVE_CHAT, ({ roomId }) => {
            // Leave the room
            socket.leave(roomId);

            // Remove the room from the activeRooms object
            delete activeChatRooms[roomId];

            // Notify other users in the room that a user has left
            socket.to(roomId).emit('user_left', { roomId });
        });

    })
}



module.exports = { socket };