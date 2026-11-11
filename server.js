const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Phục vụ file tĩnh từ thư mục hiện tại (chứa index.html)
app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    console.log('Phi công kết nối:', socket.id);

    // Người chơi tham gia phòng
    socket.on('join_game', (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || 'PhiCôngVôDanh',
            classType: data.classType || 'speed',
            x: 1750, y: 1750,
            angle: 0,
            level: 1
        };
        io.emit('update_players', players);
    });

    // Cập nhật tọa độ di chuyển liên tục
    socket.on('player_move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
            players[socket.id].level = data.level;
            socket.broadcast.emit('update_players', players);
        }
    });

    // Khi người chơi thoát game
    socket.on('disconnect', () => {
        console.log('Phi công rời trận:', socket.id);
        delete players[socket.id];
        io.emit('update_players', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server chiến trường đang chạy tại cổng ${PORT}`);
});