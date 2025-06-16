import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Stories() {
  const [topStories, setTopStories] = useState([]);

  useEffect(() => {
    axios.get('https://zchannel.onrender.com')
  // Busca os posts da rota criada
      .then(res => setTopStories(res.data))
      .catch(err => console.error('Erro ao buscar histórias:', err));
  }, []);

  return (
    <div>
      <br />
      <h1 >🔥 Ranking de Posts 🔥</h1>
      <br />
{topStories.map(story => {
  const upvotes = Object.values(story.voters).filter(v => v === 'up').length;
  const downvotes = Object.values(story.voters).filter(v => v === 'down').length;

  return (
    <div key={story._id} className="post">
      <h2>{story.title}</h2>
      <p>{story.content}</p>
      <p>👍 {upvotes} | 👎 {downvotes}</p>
    </div>
  );
})}

    </div>
  );
}
