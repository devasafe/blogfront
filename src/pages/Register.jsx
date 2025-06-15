import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/auth/register`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      navigate('/');
    } catch {
      alert('Erro no cadastro');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Cadastro</h2>
      <input placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} required />
      <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Cadastrar</button>
    </form>
  );
}
