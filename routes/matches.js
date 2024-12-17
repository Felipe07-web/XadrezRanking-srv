import express from "express";
const router = express.Router();
import Match from "../models/Match.js"; // Certifique-se de que o modelo está correto

router.post("/:id/result", async (req, res) => {
  try {
    const { result, winner } = req.body;
    const matchId = req.params.id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Partida não encontrada." });
    }

    // Empate
    if (result === "draw") {
      match.result = "draw";
      match.winner = null;
      await match.save();
      return res.status(200).json({ message: "Empate registrado com sucesso!" });
    }

    // Vitória
    if (result === "win" && winner) {
      match.result = "win";
      match.winner = winner;
      await match.save();
      return res.status(200).json({ message: "Vencedor registrado com sucesso!" });
    }

    res.status(400).json({ message: "Resultado inválido. Use 'draw' ou 'win' com um vencedor." });
  } catch (error) {
    console.error("Erro ao processar resultado:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default router;
