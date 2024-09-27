"use client";
import { useEffect, useState } from 'react';

interface Produto {
  _id: string;
  nome: string;
  preco: number;
}

const Home = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState<number | undefined>();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null); 

  const buscarProdutos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      const data = await res.json();
      setProdutos(data);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  const adicionarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    setErro(null);

    if (!nome || preco === undefined) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, preco }),
      });
      if (!res.ok) throw new Error('Erro ao adicionar produto');
      const novoProduto = await res.json();
      setProdutos((prev) => [...prev, novoProduto]);
      setNome('');
      setPreco(undefined);
      setMensagem('Produto adicionado com sucesso!');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const atualizarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    setErro(null);

    if (!produtoParaEditar || !nome || preco === undefined) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${produtoParaEditar._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, preco }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar produto');
      const produtoAtualizado = await res.json();
      setProdutos((prev) => 
        prev.map((produto) => 
          produto._id === produtoAtualizado._id ? produtoAtualizado : produto
        )
      );
      setNome('');
      setPreco(undefined);
      setProdutoParaEditar(null);
      setMensagem('Produto atualizado com sucesso!');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const deletarProduto = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar produto');
      setProdutos((prev) => prev.filter((produto) => produto._id !== id));
      setMensagem('Produto deletado com sucesso!');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const iniciarEdicao = (produto: Produto) => {
    setProdutoParaEditar(produto);
    setNome(produto.nome);
    setPreco(produto.preco);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Produtos</h1>
      {erro && <div className="text-red-500">{erro}</div>}
      {mensagem && <div className="text-green-500">{mensagem}</div>}
      <form onSubmit={produtoParaEditar ? atualizarProduto : adicionarProduto} className="my-4">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do Produto"
          className="border p-2 mr-2"
          required
        />
        <input
          type="number"
          value={preco}
          onChange={(e) => setPreco(Number(e.target.value))}
          placeholder="Preço do Produto"
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          {produtoParaEditar ? 'Atualizar Produto' : 'Adicionar Produto'}
        </button>
      </form>
      <ul>
        {produtos.map((produto) => (
          <li key={produto._id} className="flex justify-between items-center">
            <span>{produto.nome} - R${produto.preco}</span>
            <div>
              <button
                onClick={() => iniciarEdicao(produto)}
                className="bg-yellow-500 text-white p-1 mr-1"
              >
                Editar
              </button>
              <button
                onClick={() => deletarProduto(produto._id)}
                className="bg-red-500 text-white p-1"
              >
                Deletar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
