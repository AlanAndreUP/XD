const pool = require('./db'); // Asume que db.js exporta un pool de conexiones MySQL

/**
 * Guarda un mensaje en la base de datos.
 * @param {Object} message Objeto con userId y text.
 */
async function saveMessage(message) {
    const { userId, text } = message;
    try {
        const query = 'INSERT INTO mensajes (ID_USUARIO, TEXTO) VALUES (?, ?)';
        await pool.query(query, [userId, text]);
    } catch (error) {
        console.error('Error al guardar el mensaje:', error);
        throw error; 
    }
}

/**
 * Recupera todos los mensajes de la base de datos.
 * @return {Promise<Array>} Promesa que se resuelve con la lista de mensajes.
 */
async function getAllMessages() {
    try {
        const query = 'SELECT * FROM mensajes';
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error al recuperar mensajes:', error);
        throw error; // O manejar el error según convenga
    }
}

module.exports = {
    saveMessage,
    getAllMessages
};
