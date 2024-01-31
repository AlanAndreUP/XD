const express = require('express');
const pool = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecretKey = 'XDEJUEMPLO';
function createToken(user) {
  const payload = {
    userId: user._id,
    email: user.correo,
  };


  const expiration = '1h';

  return jwt.sign(payload, jwtSecretKey, { expiresIn: expiration });
}
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is not valid' });
    }
    req.user = user;
    next();
  });
}

router.get('/', async (req, res) => {
  try {
      const [rows] = await pool.query('SELECT * FROM Usuarios');
      res.status(200).json(rows);
  } catch (error) {
      console.error('Error al consultar usuarios:', error);
      res.status(500).json({ error: 'Error al consultar usuarios' });
  }
});
router.post('/login', async (req, res) => {
  const { correo, password } = req.body; 

  try {
     
      const query = 'SELECT * FROM Usuarios WHERE (Correo = ? OR Telefono = ?) AND Password = ?';
      const [users] = await pool.query(query, [correo, correo, password]);

      if (users.length === 0) {
          return res.status(401).json({ message: 'Credenciales incorrectas' });
      }

      const token = createToken(users[0]);

      res.status(200).json({ message: 'Login exitoso', user: users[0],token });
  } catch (error) {
      console.error('Error durante el login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/ALL/:id', async (req, res) => {
  try {
      const usuarioId = req.params.id;
      const [rows] = await pool.query('SELECT * FROM Usuarios WHERE ID = ?', [usuarioId]);
      if (rows.length === 0) {
          res.status(404).json({ message: 'Usuario no encontrado' });
      } else {
          res.status(200).json(rows[0]);
      }
  } catch (error) {
      console.error('Error al consultar el usuario:', error);
      res.status(500).json({ error: 'Error al consultar el usuario' });
  }
});


router.post('/', async (req, res) => {
  try {
      const { Nombre, Apellidos, Telefono, Correo, Password } = req.body;
      const result = await pool.query('INSERT INTO Usuarios (Nombre, Apellidos, Telefono, Correo, Password) VALUES (?, ?, ?, ?, ?)', [Nombre, Apellidos, Telefono, Correo, Password]);
      res.status(201).json({ message: 'Usuario creado exitosamente', insertId: result[0].insertId });
  } catch (error) {
      console.error('Error al crear un nuevo usuario:', error);
      res.status(500).json({ error: 'Error al crear un nuevo usuario' });
  }
});


router.put('/:id', async (req, res) => {
  try {
      const usuarioId = req.params.id;
      const { Nombre, Apellidos, Telefono, Correo, Password } = req.body;
      await pool.query('UPDATE Usuarios SET Nombre = ?, Apellidos = ?, Telefono = ?, Correo = ?, Password = ? WHERE ID = ?', [Nombre, Apellidos, Telefono, Correo, Password, usuarioId]);
      res.status(200).json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
      const usuarioId = req.params.id;
      await pool.query('DELETE FROM Usuarios WHERE ID = ?', [usuarioId]);
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

module.exports = router;
