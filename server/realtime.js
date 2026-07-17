const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Camada de tempo real (socket.io) com autenticação JWT e salas por contexto.
// Salas: user:{id}, shop:{id}, neighborhood:{id}, drivers:{neighborhood_id}
let io = null;

function initRealtime(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: '*' }, // o handshake HTTP já passou pelo CORS do express
    });

    // Autentica o socket pelo mesmo JWT da API
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token'));
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return next(new Error('Invalid token'));
            socket.user = user;
            next();
        });
    });

    io.on('connection', (socket) => {
        const { id, role, neighborhood_id } = socket.user;

        // Cada usuário entra na própria sala; demais salas conforme papel
        socket.join(`user:${id}`);
        if (neighborhood_id) socket.join(`neighborhood:${neighborhood_id}`);
        if (role === 'driver' && neighborhood_id) socket.join(`drivers:${neighborhood_id}`);

        // Lojista pede para entrar na sala da(s) sua(s) loja(s) — validado no evento
        socket.on('join:shop', (shopId) => {
            if (['store_owner', 'admin', 'superadmin'].includes(role)) {
                socket.join(`shop:${shopId}`);
            }
        });
    });

    return io;
}

// Emissores utilitários — no-op se o realtime não foi inicializado (ex.: testes)
function emitToUser(userId, event, payload) {
    if (io) io.to(`user:${userId}`).emit(event, payload);
}
function emitToShop(shopId, event, payload) {
    if (io) io.to(`shop:${shopId}`).emit(event, payload);
}
function emitToNeighborhood(neighborhoodId, event, payload) {
    if (io) io.to(`neighborhood:${neighborhoodId}`).emit(event, payload);
}
function emitToDrivers(neighborhoodId, event, payload) {
    if (io) io.to(`drivers:${neighborhoodId}`).emit(event, payload);
}

module.exports = { initRealtime, emitToUser, emitToShop, emitToNeighborhood, emitToDrivers };
