import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  points: { type: Number, default: 0 },
  profileImage: { type: String },
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
