import mongoose from 'mongoose';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import multer from 'multer'; // Importa o multer

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
app.use(upload.single('profileImage')); // Aponta para o campo do arquivo no FormData

// Conectar ao MongoDB
const mongoURI = process.env.MONGO_URI; // Variável de ambiente correta
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas!'))
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1); // Encerra a aplicação em caso de erro
  });

// Rotas
app.use('/players', playerRoutes);
app.use('/matches', matchRoutes);

// Rota raiz para teste
app.get("/", (req, res) => {
  res.send("✅ Servidor está ativo e funcionando!");
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
