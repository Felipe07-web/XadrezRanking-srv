import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  player1: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  result: { type: String, enum: ["win", "draw"], default: null },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  round: { type: Number, default: 1 }
});

const Match = mongoose.model("Match", matchSchema);
export default Match;
