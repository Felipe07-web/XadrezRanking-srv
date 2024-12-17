import mongoose from 'mongoose';

// Definição do esquema para partidas
const MatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  round: { type: String, required: true },
  player1Id: { type: String, required: false },
  player2Id: { type: String, required: false },
  winnerId: { type: String, required: false },
});

// Criação do modelo Match
const Match = mongoose.model('Match', MatchSchema);

export default Match;
