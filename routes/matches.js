import express from 'express';
import Match from '../models/Match.js'; // Importa o modelo Match

const router = express.Router();

// Rota para buscar todas as partidas
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find(); // Busca todas as partidas no MongoDB
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar partidas', details: error.message });
  }
});

// Rota para salvar novas partidas
router.post('/', async (req, res) => {
  try {
    const matches = req.body; // Recebe as partidas do corpo da requisição

    if (!Array.isArray(matches)) {
      return res.status(400).json({ error: 'O corpo da requisição deve ser um array de partidas' });
    }

    await Match.deleteMany(); // Limpa as partidas existentes, se necessário
    const savedMatches = await Match.insertMany(matches); // Insere novas partidas
    res.status(201).json({ message: 'Partidas salvas com sucesso!', matches: savedMatches });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar partidas', details: error.message });
  }
});

export default router;
