import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  profileImage: { type: String, default: '' },
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
});

export default mongoose.model('Player', PlayerSchema);
