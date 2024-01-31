const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const morgan = require('morgan');
const { saveMessage, getAllMessages } = require('./messages');
const pool = require('./db');
const wss = new WebSocket.Server({ noServer: true });
const pendingRequests = new Map();
const connections = new Map(); 
const allConnectionIDs = {};
const messageBuffer = new Map(); 
let connectionID = 0;
let messageID = 0;
const app = express();
const server = http.createServer(app);
app.use(morgan('dev'));
const port = process.env.PORT || 3002;

require('dotenv').config();

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));


const userRoutes = require('./routesSQL/login');
app.use(userRoutes);
app.get('/active-users', async (req, res) => {
    try {

        const activeUsers = await Promise.all(Array.from(connections.keys()).map(async (userId) => {
            const [rows] = await pool.query('SELECT * FROM Usuarios WHERE ID = ?', [userId]);
            const user = rows.length > 0 ? rows[0] : null;

            return {
                userId,
                userName: user ? user.Nombre : 'Desconocido',
                connected: true
            };
        }));

        res.json(activeUsers);
    } catch (error) {
        console.error('Error al obtener usuarios activos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/user-status/:userId', (req, res) => {
    const userId = parseInt(req.params.userId.replace('User', ''), 10);
    console.log(userId);
    if (connections.has(userId)) {
        res.json({ connected: false });
    } else {
        if (!pendingRequests.has(userId)) {
            pendingRequests.set(userId, res);
        }
        
    }
});

wss.on('connection', async (ws) => {
    let currentUserId = null;

  
    try {
        const messages = await getAllMessages();
        messages.forEach((message) => {
            ws.send(JSON.stringify(message));
        });
    } catch (error) {
        console.error('Error al recuperar mensajes:', error);
    }

    ws.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage)
      
            if (parsedMessage.userId) {
                currentUserId = parsedMessage.userId;
                connections.set(currentUserId, ws);

             
                await saveMessage(parsedMessage);

          
                connections.forEach((client, clientId) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            }
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
        }
    });

    ws.on('close', () => {
        if (currentUserId) {
            connections.delete(currentUserId);
            console.log(currentUserId);
            console.log(pendingRequests);
            const userRequests = pendingRequests.get(parseInt(currentUserId));
            console.log(userRequests);
            if (userRequests) {
                userRequests.json({ connected: false});
                pendingRequests.delete(currentUserId);
            }
            
        }
    });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {

    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });

});