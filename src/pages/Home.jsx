import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css'; // Novo arquivo CSS para a Home
import '../App.css'; // Estilos globais
import '../index.css'; // Estilos globais

export default function HomePage() {
  const navigate = useNavigate();
  const [topUsers, setTopUsers] = useState([]);
  const [topCategories, setTopCategories] = useState([]);

  // Função para buscar o ranking de usuários
  const fetchTopUsers = async () => {
    try {
      // Por enquanto, dados simulados. A rota real será implementada no backend.
      const response = await axios.get(`${process.env.REACT_APP_API}/forum/ranking/users`);
      setTopUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar top usuários:', error);
      // Dados simulados para desenvolvimento se a API falhar
      setTopUsers([
        { _id: 'user1', username: 'Anonimo_Coder', totalInteractions: 150 },
        { _id: 'user2', username: 'Crypto_Mind', totalInteractions: 120 },
        { _id: 'user3', username: 'CyberPunk01', totalInteractions: 95 },
        { _id: 'user4', username: 'GhostWriter', totalInteractions: 80 },
        { _id: 'user5', username: 'DeepWebDiver', totalInteractions: 70 },
      ]);
    }
  };

  // Função para buscar o ranking de categorias
  const fetchTopCategories = async () => {
    try {
      // Por enquanto, dados simulados. A rota real será implementada no backend.
      const response = await axios.get(`${process.env.REACT_APP_API}/forum/ranking/categories`);
      setTopCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar top categorias:', error);
      // Dados simulados para desenvolvimento se a API falhar
      setTopCategories([
        { name: 'Teorias da Conspiração', count: 75 },
        { name: 'Misterios Não Solucionados', count: 60 },
        { name: 'Tecnologia Obscura', count: 48 },
        { name: 'Filosofia Pós-Moderna', count: 32 },
        { name: 'Crítica Social Anônima', count: 25 },
      ]);
    }
  };

  useEffect(() => {
    fetchTopUsers();
    fetchTopCategories();
  }, []);

  return (
    <div className="home-container">
      {/* Seção de Boas-Vindas - Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Sua Voz. Seu Segredo.</h1>
        <p className="hero-subtitle">
          Um espaço anônimo para discutir o que realmente importa. <br />
          Tópicos não-convencionais, opiniões sinceras, conversas que fluem.
        </p>
        <button onClick={() => navigate('/forum')} className="hero-button">
          Entre no Fórum
        </button>
      </section>

      {/* Seção de Rankings */}
      <section className="rankings-section">
        {/* Ranking de Perfis */}
        <div className="ranking-card">
          <h2 className="ranking-title">Top 5 Perfis</h2>
          <ul className="ranking-list">
            {topUsers.length > 0 ? (
              topUsers.map((user, index) => (
                <li key={user._id || index} className="ranking-item">
                  <span className="ranking-number">{index + 1}.</span>
                  <span className="ranking-name">{user.username}</span>
                  <span className="ranking-value">{user.totalInteractions} interações</span>
                </li>
              ))
            ) : (
              <li className="loading-rank">Carregando perfis...</li>
            )}
          </ul>
        </div>

        {/* Ranking de Categorias */}
        <div className="ranking-card">
          <h2 className="ranking-title">Top 5 Categorias</h2>
          <ul className="ranking-list">
            {topCategories.length > 0 ? (
              topCategories.map((cat, index) => (
                <li key={cat.name || index} className="ranking-item">
                  <span className="ranking-number">{index + 1}.</span>
                  <span className="ranking-name">{cat.name}</span>
                  <span className="ranking-value">{cat.count} posts</span>
                </li>
              ))
            ) : (
              <li className="loading-rank">Carregando categorias...</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
