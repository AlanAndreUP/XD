const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host: 'localhost', // o la IP del servidor de la base de datos
    user: 'root', // reemplaza con tu usuario de MySQL
    password: 'Jaguares34.', // reemplaza con tu contraseña de MySQL
    database: 'api', // reemplaza con el nombre de tu base de datos
});



module.exports = pool;
