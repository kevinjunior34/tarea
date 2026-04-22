const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors'); 
const path = require('path');
const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createPool({
  host    : 'localhost',
  port    : 3306,
  database: 'basededatos',
  user    : 'root',
  password: '',
});

// ── RUTAS CRUD DE PROVEEDORES ─────────────────────────────────────────────────

// GET /proveedores — Listar todos
app.get('/proveedores', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM proveedor');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /proveedores/:id — Obtener uno por ID
app.get('/proveedores/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM proveedor WHERE id_proveedor = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /proveedores — Crear nuevo proveedor
app.post('/proveedores', async (req, res) => {
  const { razonsocial, direccion, telefono } = req.body;
  if (!razonsocial || !direccion || !telefono) {
    return res.status(400).json({ mensaje: 'Faltan campos: razonsocial, direccion, telefono' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO proveedor (razonsocial, direccion, telefono) VALUES (?, ?, ?)',
      [razonsocial, direccion, telefono]
    );
    res.status(201).json({
      mensaje     : 'Proveedor creado',
      id_proveedor: result.insertId,
      razonsocial,
      direccion,
      telefono,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /proveedores/:id — Actualizar proveedor
app.put('/proveedores/:id', async (req, res) => {
  const { razonsocial, direccion, telefono } = req.body;
  if (!razonsocial || !direccion || !telefono) {
    return res.status(400).json({ mensaje: 'Faltan campos: razonsocial, direccion, telefono' });
  }
  try {
    const [result] = await db.query(
      `UPDATE proveedor
       SET razonsocial = ?, direccion = ?, telefono = ?
       WHERE id_proveedor = ?`,
      [razonsocial, direccion, telefono, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
    res.json({ mensaje: 'Proveedor actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /proveedores/:id — Eliminar proveedor
app.delete('/proveedores/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM proveedor WHERE id_proveedor = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
