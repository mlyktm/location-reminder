function load_sessions() {
  const sessions = JSON.parse(localStorage.getItem('prev_songs') || '[]');
  const table = document.getElementById('previous-sessions');  // Changed from 'sessionsTable'
  const status = document.getElementById('history');
  const tbody = document.getElementById('sessions-table');

  //if no sessions, no table
  if (sessions.length === 0) {
    table.style.display = 'none';
    status.style.display = 'block';
    return;
  }

  table.style.display = 'table';
  status.style.display = 'none';
  tbody.innerHTML = '';

  //add each prev session to table
  sessions.forEach(session =>{
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${session.emoji}</td>
      <td>${new Date(session.date).toLocaleDateString()}</td>
      <td>${session.tracks.map(t => t.trackName).join(', ')}</td>
    `;
    tbody.appendChild(row);
  });
}

//store session in history
function save_session(emoji, songs){
  const sessions = JSON.parse(localStorage.getItem('prev_songs') || '[]');
  sessions.push({
    emoji: emoji,
    date: new Date().toISOString(),
    tracks: songs.map(s => ({trackName: s.trackName, artistName: s.artistName}))
  });
  localStorage.setItem('prev_songs', JSON.stringify(sessions));   //store in local storage
  load_sessions();
}


document.getElementById("get-songs-btn").addEventListener("click", async () => { 
    const emoji = document.getElementById("emoji").value.trim();
      const resKeywords = await fetch("http://localhost:3000/emoji-to-keywords", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({emoji}),
      }); //req keywords
      const {keywords} = await resKeywords.json();
      document.getElementById("keywords").textContent = keywords.join(", ");  //format
      
      const resSongs = await fetch("http://localhost:3000/songs", { //req songs
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({keywords, minMatches: 1}),  //match 1+ keyword
      });
      
      const {songs} = await resSongs.json();
      const listEl = document.getElementById("recommendation-list");
      listEl.innerHTML = "";
      
      if (!songs || songs.length === 0) { //no songs found
        listEl.innerHTML = "<li>No songs found.</li>";
        return;
      }
      
      songs.forEach(song => {
        const li = document.createElement("li");
        li.innerHTML = `
          ${song.trackName} by ${song.artistName}
          ${song.previewUrl ? `<br><audio controls src="${song.previewUrl}"></audio>` : ''}
        `;
        listEl.appendChild(li);
      });
      save_session(emoji, songs);
});
  