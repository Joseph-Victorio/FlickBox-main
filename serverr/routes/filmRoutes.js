import express from 'express';
import { connection } from '../config/db.js';

const router = express.Router();

// Tambah film
router.post('/add', (req, res) => {
  const { title, year, genre, synopsis, actors, poster } = req.body;

  const sql = `INSERT INTO films (title, year, genre, synopsis, actors, poster) VALUES (?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [title, year, genre, synopsis, actors, poster], (err, result) => {
    if (err) {
      console.error('Error inserting film:', err);
      return res.status(500).json({ error: 'Gagal menambahkan film' });
    }

    res.status(201).json({
      message: 'Film berhasil ditambahkan',
      filmId: result.insertId,
    });
  });
});

export default router;
