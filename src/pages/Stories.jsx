import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Stories() {
  const [topStories, setTopStories] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/forum/top`)
      .then(res => setTopStories(res.data))
      .catch(err => console.error('Erro ao buscar histórias:', err));
  }, []);

  return (
    <div>
      <h1>🔥 Ranking de Posts 🔥</h1>
      {topStories.map(story => {
        // As lógicas de upvotes/downvotes baseadas em voters map
        const upvotes = story.voters ? Object.values(story.voters).filter(v => v === 'up').length : 0;
        const downvotes = story.voters ? Object.values(story.voters).filter(v => v === 'down').length : 0;

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
