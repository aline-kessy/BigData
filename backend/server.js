const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
}).then(() => {
  console.log("MongoDB conectado");
}).catch((err) => {
  console.error("Erro ao conectar ao MongoDB:", err);
});


app.use(cors());
app.use(bodyParser.json());


const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
});

const Produto = mongoose.model('Produto', produtoSchema);

app.get('/api/products', async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/api/products', async (req, res) => {
  const { nome, preco } = req.body;


  if (!nome || preco === undefined) {
    return res.status(400).json({ message: "Nome e preço são obrigatórios." });
  }

  const novoProduto = new Produto({
    nome,
    preco,
  });

  try {
    const produtoSalvo = await novoProduto.save();
    res.status(201).json(produtoSalvo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const produtoDeletado = await Produto.findByIdAndDelete(req.params.id);
    if (!produtoDeletado) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }
    res.json({ message: "Produto deletado com sucesso." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
    const { nome, preco } = req.body;

    if (!nome || preco === undefined) {
      return res.status(400).json({ message: "Nome e preço são obrigatórios." });
    }
  
    try {
      const produtoAtualizado = await Produto.findByIdAndUpdate(
        req.params.id,
        { nome, preco },
        { new: true, runValidators: true }
      );
  
      if (!produtoAtualizado) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }
  
      res.json(produtoAtualizado);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});