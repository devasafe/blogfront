import { useParams, useNavigate } from 'react-router-dom'; // Importar useNavigate
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/forum.css'; // Reutilizar estilos do fórum

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate(); // Inicializar useNavigate
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        // Buscar o post específico pelo ID
        const postRes = await axios.get(`${process.env.REACT_APP_API}/forum/${id}`);
        setPost(postRes.data);

        // Buscar todos os comentários para este post
        const commentsRes = await axios.get(`${process.env.REACT_APP_API}/forum/${id}/comments?all=true`);
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Erro ao carregar post ou comentários:", err);
        // Opcional: redirecionar para uma página de erro ou home se o post não for encontrado
        // navigate('/');
      }
    };

    fetchPostAndComments();
  }, [id, token]); // Adicionado token como dependência para re-fetch se o token mudar

  const handleVote = async (type) => {
    if (!token) return alert('Faça login para votar');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/forum/${id}/vote`, { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost({ ...post, votes: res.data.votes });
    } catch (error) {
      console.error("Erro ao votar no post:", error);
      alert("Erro ao votar no post.");
    }
  };

  const handleCommentVote = async (commentId, type) => {
    if (!token) return alert('Faça login para votar');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/comments/${commentId}/vote`, { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.map(c => c._id === commentId ? { ...c, votes: res.data.votes } : c));
    } catch (error) {
      console.error("Erro ao votar no comentário:", error);
      alert("Erro ao votar no comentário.");
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return alert('Comentário vazio');
    if (!token) return alert('Faça login para comentar');
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/forum/${id}/comments`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      // Recarregar os comentários após adicionar um novo
      const cRes = await axios.get(`${process.env.REACT_APP_API}/forum/${id}/comments?all=true`);
      setComments(cRes.data);
    } catch (error) {
      console.error("Erro ao comentar:", error);
      alert("Erro ao comentar.");
    }
  };

  if (!post) return <p className="loading-message">Carregando post...</p>; // Adicionado classe para estilo

  return (
    <div className="forum-container"> {/* Reutiliza o container principal para centralizar */}
      <section className="forum-main" style={{ maxWidth: '800px', margin: 'auto' }}> {/* Ajusta o estilo para esta página */}
        <div className="post"> {/* Reutiliza a classe 'post' para o post principal */}
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {post.file && (
            <div className="post-media">
              <img src={post.file} alt="Post Media" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
            </div>
          )}
          <p>
            Postado por <b>{post.user?.username}</b> em{' '} {/* Alterado de user?.name para user?.username */}
            {new Date(post.createdAt).toLocaleString()}
          </p>
          <div className="post-votes">
            <button onClick={() => handleVote('up')}>👍</button>
            <span>{post.votes}</span>
            <button onClick={() => handleVote('down')}>👎</button>
          </div>
        </div>

        <div className="comment-section"> {/* Reutiliza a classe 'comment-section' */}
          <h3>Comentários</h3>
          {comments.length > 0 ? (
            comments.map(c => (
              <div key={c._id} className="comment"> {/* Reutiliza a classe 'comment' */}
                <p>
                  <b>{c.user?.username}</b> comentou em {new Date(c.createdAt).toLocaleString()} {/* Alterado para username */}
                </p>
                <p>{c.content}</p>
                <div className="comment-votes">
                  <button onClick={() => handleCommentVote(c._id, 'up')}>👍</button>
                  <span>{c.votes || 0}</span>
                  <button onClick={() => handleCommentVote(c._id, 'down')}>👎</button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-comments">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          )}

          <textarea
            placeholder="Novo comentário"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="comment-textarea" // Adicionada classe para estilo
          />
          <button onClick={handleComment} className="comment-button">Comentar</button> {/* Adicionada classe para estilo */}
        </div>
      </section>
    </div>
  );
}
