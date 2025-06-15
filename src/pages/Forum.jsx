import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/forum.css";
import "../App.css";
import "../index.css";

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("discussao"); // Valor padrão
  const [file, setFile] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Função para converter arquivo para base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  // Função para buscar os posts e calcular as categorias existentes
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API}/forum`);
      setPosts(res.data);

      const categoryCount = {};
      res.data.forEach(post => {
        const cat = post.type;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const sortedCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      setCategories(sortedCategories);

      // --- LOGS DE DEPURACAO ---
      console.log("Posts carregados:", res.data);
      console.log("Categorias detectadas e contadas:", categoryCount);
      console.log("Categorias no estado:", sortedCategories);
      // --- FIM DOS LOGS ---

      // Buscar os comentários de cada post
      for (const post of res.data) {
        const cRes = await axios.get(`${process.env.REACT_APP_API}/forum/${post._id}/comments`);
        setComments(prev => ({ ...prev, [post._id]: cRes.data }));
      }
    } catch (err) {
      console.error("Erro ao carregar posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Função de envio do formulário de post
  const handlePost = async (e) => {
    e.preventDefault();
    if (!token) return alert("Faça login para postar");

    // Se estiver adicionando nova categoria, garanta que foi digitada
    if (type === "nova" && !newCategory.trim()) {
      return alert("Digite o nome da nova categoria");
    }

    try {
      let fileData = null;
      if (file) fileData = await toBase64(file);

      // Define a categoria a ser enviada: nova ou já selecionada
      const categoryToSend = type === "nova" ? newCategory : type;

      await axios.post(
        `${process.env.REACT_APP_API}/forum`,
        { title, content, type: categoryToSend, file: fileData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle("");
      setContent("");
      setFile(null);
      setNewCategory("");
      // Após postar, atualiza a listagem de posts e categorias
      fetchPosts();
    } catch (error) {
      console.error("Erro ao postar:", error);
      alert("Erro ao postar");
    }
  };

  // Função para enviar um comentário em um post
  const handleComment = async (postId) => {
    if (!token) return alert("Faça login para comentar");
    const commentContent = newComment[postId]?.trim();
    if (!commentContent) return alert("Digite algo antes de comentar");

    try {
      await axios.post(
        `${process.env.REACT_APP_API}/forum/${postId}/comments`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewComment(prev => ({ ...prev, [postId]: "" }));
      const cRes = await axios.get(`${process.env.REACT_APP_API}/forum/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: cRes.data }));
    } catch (error) {
      console.error("Erro ao comentar:", error);
      alert("Erro ao comentar");
    }
  };

  // Função para lidar com cliques no post (para abrir/visualizar)
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Função para lidar com votos (upvote/downvote)
  const handleVote = async (postId, voteType) => {
    if (!token) return alert("Faça login para votar");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/forum/${postId}/vote`,
        { type: voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Atualiza a contagem de votos do post na UI
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, votes: res.data.votes } : post
        )
      );
    } catch (error) {
      console.error(`Erro ao votar no post ${postId}:`, error);
      alert("Erro ao votar no post.");
    }
  };

  return (
    // O .forum-container do CSS agora será o div pai que controla o layout de colunas
    <div className="forum-container"> 
      <div className="forum-layout-columns"> {/* NOVO: Div para o layout de duas colunas */}
        {/* Conteúdo principal (formulário e listagem de posts) */}
        <section className="forum-main">
          <h2>Fórum</h2>

          {/* Formulário de criação de post */}
          <div className="forum-form-container">
            <h3>Nova Postagem</h3>
            <form className="forum-form" onSubmit={handlePost}>
              <input
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Conteúdo"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {/* Adicionando "discussao" como opção padrão se não houver categorias carregadas ainda */}
                {categories.length === 0 && (
                  <option value="discussao">Discussão</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                <option value="nova">Adicionar nova categoria...</option>
              </select>
              {type === "nova" && (
                <input
                  type="text"
                  placeholder="Digite a nova categoria"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              )}
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <button type="submit">Postar</button>
            </form>
          </div>

          <hr />

          {/* Listagem de posts filtrados */}
          {posts
            .filter(post =>
              !selectedCategory ||
              (post.type && post.type.toLowerCase() === selectedCategory.toLowerCase()) // Filtragem case-insensitive
            )
            .map((post) => (
              <div key={post._id} className="post">
                {/* Adicionado onClick para lidar com o clique no post */}
                <div onClick={() => handlePostClick(post._id)} style={{ cursor: 'pointer' }}>
                  <h3>{post.title} ({post.type})</h3>
                  <p>{post.content}</p>
                  {/* Exibição da imagem, se houver */}
                  {post.file && (
                    <div className="post-media">
                      <img src={post.file} alt="Post Media" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                    </div>
                  )}
                  <p>
                    Postado por <b>{post.user?.username}</b> em{" "}
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Seção de votos */}
                <div className="post-votes">
                  <button onClick={() => handleVote(post._id, 'up')}>👍</button>
                  <span>{post.votes}</span>
                  <button onClick={() => handleVote(post._id, 'down')}>👎</button>
                </div>

                {/* Exibição de comentários */}
                <div className="comment-section">
                  <h4>Comentários</h4>
                  {/* Inverte a ordem dos comentários para que o mais novo fique embaixo */}
                  {comments[post._id]?.slice(0, 3).slice().reverse().map(c => (
                    <div key={c._id} className="comment">
                      <p>
                        <b>{c.user?.username}</b> comentou em{" "}
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                      <p>{c.content}</p>
                    </div>
                  ))}
                  <textarea
                    placeholder="Comente..."
                    value={newComment[post._id] || ""}
                    onChange={e =>
                      setNewComment(prev => ({ ...prev, [post._id]: e.target.value }))
                    }
                  />
                  <button onClick={() => handleComment(post._id)}>Comentar</button>
                </div>
              </div>
            ))}
        </section>

        {/* NOVO: Sidebar de categorias à direita */}
        <aside className="forum-right-sidebar">
          <h3>Categorias</h3>
          <ul>
            {/* Adicionado "Mostrar todas" no início para sempre ter uma opção de ver tudo */}
            <li
              className={!selectedCategory ? "active" : ""}
              onClick={() => setSelectedCategory("")}
            >
              Mostrar todas
            </li>
            {categories.map((cat) => (
              <li
                key={cat.name}
                className={selectedCategory === cat.name ? "active" : ""}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name} ({cat.count})
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
