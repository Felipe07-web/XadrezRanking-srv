import express from 'express';
import Player from '../models/Player.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error.message);
    res.status(500).json({ error: 'Erro ao buscar jogadores', details: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    console.error('Erro ao criar jogador:', error.message);
    res.status(500).json({ error: 'Erro ao criar jogador', details: error.message });
  }
});

router.patch('/:id/points', async (req, res) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;

    if (typeof increment !== 'number') {
      return res.status(400).json({ error: 'Incremento deve ser um número' });
    }

    const updatedPlayer = await Player.findOneAndUpdate(
      { id: id },
      { $inc: { points: increment } },
      { new: true, runValidators: true }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    res.json(updatedPlayer);
  } catch (error) {
    console.error('Erro ao atualizar pontos:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar pontos', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPlayer = await Player.findOneAndDelete({ id: id });

    if (!deletedPlayer) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    res.json({ message: 'Jogador excluído com sucesso!', player: deletedPlayer });
  } catch (error) {
    console.error('Erro ao excluir jogador:', error.message);
    res.status(500).json({ error: 'Erro ao excluir jogador', details: error.message });
  }
});

export default router;
