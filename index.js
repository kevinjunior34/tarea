const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 conexión a Supabase (PostgreSQL)
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


// ── RUTAS CRUD DE PROVEEDORES ─────────────────────────────────

// GET todos
app.get('/proveedores', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM proveedor');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET por ID
app.get('/proveedores/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM proveedor WHERE id_proveedor = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear
app.post('/proveedores', async (req, res) => {
  const { razonsocial, direccion, telefono } = req.body;

  if (!razonsocial || !direccion || !telefono) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  try {
    const result = await db.query(
      `INSERT INTO proveedor (razonsocial, direccion, telefono)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [razonsocial, direccion, telefono]
    );

    res.status(201).json({
      mensaje: 'Proveedor creado',
      proveedor: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar
app.put('/proveedores/:id', async (req, res) => {
  const { razonsocial, direccion, telefono } = req.body;

  if (!razonsocial || !direccion || !telefono) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  try {
    const result = await db.query(
      `UPDATE proveedor
       SET razonsocial = $1, direccion = $2, telefono = $3
       WHERE id_proveedor = $4
       RETURNING *`,
      [razonsocial, direccion, telefono, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.json({ mensaje: 'Proveedor actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/proveedores/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM proveedor WHERE id_proveedor = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── TEST ─────────────────────────────────
app.get('/test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ── SERVIDOR ─────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});