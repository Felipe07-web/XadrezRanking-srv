//comando para restar pontos  curl -X POST http://localhost:8080/players/reset

import mongoose from 'mongoose';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import multer from 'multer'; // Importa o multer
import Player from './models/Player.js'; // Importa o modelo Player

// Inicialização do Express
const app = express();

// Porta dinâmica definida pelo Railway
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuração global do Multer (para arquivos pequenos)
const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

// Middleware para uploads (aplicado em rotas que aceitam arquivos)
app.use(upload.single('profileImage')); // Campo de arquivo no FormData

// Conectar ao MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MONGO_URI não definido no arquivo .env');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas!'))
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// Rotas
app.use('/players', playerRoutes);
app.use('/matches', matchRoutes);

// Rota raiz para teste
app.get("/", (req, res) => {
  res.send("✅ Servidor está ativo e funcionando!");
});

// Rota para resetar os pontos dos jogadores
app.post("/players/reset", async (req, res) => {
  try {
    // Verifica se há jogadores no banco
    const totalPlayers = await Player.countDocuments();
    if (totalPlayers === 0) {
      return res.status(404).send({ message: "Nenhum jogador encontrado para resetar pontos." });
    }

    // Reseta os pontos
    await Player.updateMany({}, { $set: { points: 0 } });
    res.status(200).send({ message: "Pontos resetados com sucesso!" });
  } catch (error) {
    console.error("Erro ao resetar pontos:", error);
    res.status(500).send({ error: "Erro ao resetar pontos" });
  }
});


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
