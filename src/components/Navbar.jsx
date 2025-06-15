import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Home</Link> |{' '}
      <Link to="/stories">Ranking</Link> |{' '}
      <Link to="/forum">Fórum</Link> |{' '}
      <Link to="/about">Sobre</Link> |{' '}
      {token ? (
        <>
          <span>{localStorage.getItem('username')}</span> |{' '}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> | <Link to="/register">Cadastro</Link>
        </>
      )}
    </nav>
  );
}
