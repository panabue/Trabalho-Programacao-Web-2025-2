async function loadUserPlaylists() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("Usuário não está logado");
    return;
  }

  const playlistsContainer = document.querySelector(".minhas-playlists");
  if (!playlistsContainer) {
    console.log("Container de playlists não encontrado");
    return;
  }

  try {
    const response = await fetch("http://localhost:8081/playlist", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const playlists = await response.json();
      displayPlaylists(playlists, playlistsContainer);
    } else {
      if (response.status === 403 || response.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      console.error("Erro ao carregar playlists");
      playlistsContainer.innerHTML =
        '<p style="color: #aaa; padding: 20px;">Erro ao carregar suas playlists.</p>';
    }
  } catch (error) {
    console.error("Erro ao buscar playlists:", error);
    playlistsContainer.innerHTML =
      '<p style="color: #aaa; padding: 20px;">Erro de conexão ao carregar playlists.</p>';
  }
}

function displayPlaylists(playlists, container) {
  if (playlists.length === 0) {
    container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <i class="fa-solid fa-music" style="font-size: 48px; color: #555; margin-bottom: 20px;"></i>
                <h3 style="color: #aaa; margin-bottom: 10px;">Nenhuma playlist criada ainda</h3>
                <p style="color: #777;">Crie sua primeira playlist clicando em "Criar Playlist" na barra lateral.</p>
            </div>
        `;
    return;
  }

  let html = `
        <div class="section-header" style="margin-bottom: 20px;">
            <h3>Minhas Playlists</h3>
        </div>
        <div class="card-list playlist-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">
    `;

  playlists.forEach((playlist) => {
    const playlistImage = playlist.coverUrl || "../assets/playlist-default.jpg";
    const songCount = playlist.musics ? playlist.musics.length : 0;

    html += `
            <div class="playlist-card" onclick="openPlaylist('${
              playlist.id
            }')" style="cursor: pointer; background: #181818; border-radius: 8px; padding: 16px; transition: background 0.3s;">
                <div style="position: relative; margin-bottom: 16px;">
                    <img src="${playlistImage}" alt="${playlist.name}"
                         style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; background: #333;"
                         onerror="this.src='../assets/img2.jpg'">
                    <div class="play-overlay" style="position: absolute; bottom: 8px; right: 8px; width: 48px; height: 48px; background: #1db954; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s;">
                        <i class="fa-solid fa-play" style="color: black; margin-left: 3px;"></i>
                    </div>
                </div>
                <div>
                    <h4 style="color: white; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${
                      playlist.name
                    }</h4>
                    <p style="color: #b3b3b3; margin: 0; font-size: 14px;">${
                      playlist.description || ""
                    }</p>
                    <p style="color: #b3b3b3; margin: 4px 0 0 0; font-size: 13px;">${songCount} música${
      songCount !== 1 ? "s" : ""
    }</p>
                </div>
            </div>
        `;
  });

  html += `
        </div>
    `;

  container.innerHTML = html;

  const playlistCards = container.querySelectorAll(".playlist-card");
  playlistCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.background = "#282828";
      const playOverlay = card.querySelector(".play-overlay");
      if (playOverlay) playOverlay.style.opacity = "1";
    });
    card.addEventListener("mouseleave", () => {
      card.style.background = "#181818";
      const playOverlay = card.querySelector(".play-overlay");
      if (playOverlay) playOverlay.style.opacity = "0";
    });
  });
}

async function openPlaylist(playlistId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado para ver a playlist.");
    return;
  }

  console.log("Opening playlist with ID:", playlistId);

  try {
    const response = await fetch(
      `http://localhost:8081/playlist/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response status:", response.status);

    if (response.ok) {
      const playlist = await response.json();
      console.log("Playlist data:", playlist);
      console.log("Musics in playlist:", playlist.musics);
      displayPlaylistDetails(playlist);
    } else {
      if (response.status === 403 || response.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      const errorText = await response.text();
      console.error("Error response:", errorText);
      alert("Erro ao carregar detalhes da playlist.");
    }
  } catch (error) {
    console.error("Erro ao abrir playlist:", error);
    alert("Erro de conexão ao abrir playlist.");
  }
}

function displayPlaylistDetails(playlist) {
  const contentContainer = document.getElementById("page-content");
  const musics = playlist.musics || [];

  let html = `
        <div class="playlist-detail-header" style="padding: 40px 20px; background: linear-gradient(180deg, #3e3e3e 0%, #121212 100%);">
            <div style="display: flex; align-items: flex-end; gap: 24px;">
                <img src="${
                  playlist.coverUrl || "../assets/playlist-default.jpg"
                }"
                     alt="${playlist.name}"
                     style="width: 232px; height: 232px; object-fit: cover; border-radius: 4px; box-shadow: 0 4px 60px rgba(0,0,0,.5); background: #333;"
                     onerror="this.src='../assets/img2.jpg'">
                <div>
                    <p style="color: white; font-size: 12px; font-weight: 700; margin: 0;">PLAYLIST</p>
                    <h1 style="color: white; font-size: 48px; font-weight: 900; margin: 8px 0;">${
                      playlist.name
                    }</h1>
                    <p style="color: #b3b3b3; margin: 8px 0 0 0;">${
                      playlist.description || ""
                    }</p>
                    <p style="color: white; margin: 8px 0 0 0; font-size: 14px;">${
                      musics.length
                    } música${musics.length !== 1 ? "s" : ""}</p>
                </div>
            </div>
        </div>

        <div class="playlist-actions" style="padding: 24px 20px; background: #121212;">
            <button onclick="playPlaylist('${
              playlist.id
            }')" style="background: #1db954; color: white; border: none; padding: 12px 32px; border-radius: 500px; font-size: 16px; font-weight: 700; cursor: pointer; margin-right: 16px;">
                <i class="fa-solid fa-play"></i> Reproduzir
            </button>
            <button onclick="deletePlaylist('${
              playlist.id
            }')" style="background: transparent; color: #b3b3b3; border: 1px solid #b3b3b3; padding: 12px 32px; border-radius: 500px; font-size: 16px; font-weight: 700; cursor: pointer;">
                <i class="fa-solid fa-trash"></i> Excluir Playlist
            </button>
        </div>

        <div class="playlist-tracks" style="padding: 0 20px 40px 20px; background: #121212;">
    `;

  if (musics.length === 0) {
    html += `
            <div style="padding: 40px; text-align: center;">
                <i class="fa-solid fa-music" style="font-size: 48px; color: #555; margin-bottom: 20px;"></i>
                <h3 style="color: #aaa;">Esta playlist está vazia</h3>
                <p style="color: #777;">Adicione músicas clicando no botão + ao lado do player.</p>
            </div>
        `;
  } else {
    html += `
            <table style="width: 100%; color: white; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #282828;">
                        <th style="padding: 12px; text-align: left; color: #b3b3b3; font-weight: 400; font-size: 14px; width: 40px;">#</th>
                        <th style="padding: 12px; text-align: left; color: #b3b3b3; font-weight: 400; font-size: 14px;">TÍTULO</th>
                        <th style="padding: 12px; text-align: left; color: #b3b3b3; font-weight: 400; font-size: 14px;">ARTISTA</th>
                        <th style="padding: 12px; text-align: center; color: #b3b3b3; font-weight: 400; font-size: 14px; width: 100px;">AÇÕES</th>
                    </tr>
                </thead>
                <tbody>
        `;

    musics.forEach((music, index) => {
      html += `
                <tr style="border-bottom: 1px solid #282828; cursor: pointer;"
                    onmouseenter="this.style.background='#282828'"
                    onmouseleave="this.style.background='transparent'"
                    onclick="playSongFromPlaylistDetails(${index})">
                    <td style="padding: 12px; color: #b3b3b3;">${index + 1}</td>
                    <td style="padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${music.coverUrl || "../assets/img2.jpg"}"
                                 alt="${music.title}"
                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; background: #333;"
                                 onerror="this.src='../assets/img2.jpg'">
                            <span style="color: white; font-weight: 400;">${
                              music.title
                            }</span>
                        </div>
                    </td>
                    <td style="padding: 12px; color: #b3b3b3;">${
                      music.artist
                    }</td>
                    <td style="padding: 12px; text-align: center;" onclick="event.stopPropagation();">
                        <button onclick="removeMusicFromPlaylist('${
                          playlist.id
                        }', '${music.id}')"
                                style="background: transparent; border: none; color: #b3b3b3; cursor: pointer; padding: 8px;"
                                title="Remover da playlist">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
    });

    html += `
                </tbody>
            </table>
        `;
  }

  html += `
        </div>
        <button onclick="loadContent('biblioteca')"
                style="margin: 20px; background: transparent; color: white; border: 1px solid white; padding: 10px 20px; border-radius: 500px; cursor: pointer;">
            <i class="fa-solid fa-arrow-left"></i> Voltar para Biblioteca
        </button>
    `;

  contentContainer.innerHTML = html;

  window.currentPlaylistData = {
    id: playlist.id,
    name: playlist.name,
    musics: musics.map((music) => ({
      title: music.title,
      artist: music.artist,
      album: music.album,
      src: music.previewUrl,
      albumArt: music.coverUrl,
      spotifyId: music.spotifyId,
    })),
  };

  console.log("Stored currentPlaylistData:", window.currentPlaylistData);
}

async function deletePlaylist(playlistId) {
  if (!confirm("Tem certeza que deseja excluir esta playlist?")) {
    return;
  }

  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `http://localhost:8081/playlist/${playlistId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Playlist excluída com sucesso!");
      loadContent("biblioteca");
    } else {
      if (response.status === 403 || response.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      alert("Erro ao excluir playlist.");
    }
  } catch (error) {
    console.error("Erro ao excluir playlist:", error);
    alert("Erro de conexão ao excluir playlist.");
  }
}

async function removeMusicFromPlaylist(playlistId, musicId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `http://localhost:8081/playlist/${playlistId}/remove/${musicId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Música removida da playlist!");
      openPlaylist(playlistId);
    } else {
      if (response.status === 403 || response.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      alert("Erro ao remover música da playlist.");
    }
  } catch (error) {
    console.error("Erro ao remover música:", error);
    alert("Erro de conexão ao remover música.");
  }
}

function playPlaylist(playlistId) {
  console.log("=== playPlaylist called ===");
  console.log("Playlist ID:", playlistId);
  console.log("currentPlaylistData:", window.currentPlaylistData);

  if (
    !window.currentPlaylistData ||
    !window.currentPlaylistData.musics ||
    window.currentPlaylistData.musics.length === 0
  ) {
    alert("Esta playlist está vazia!");
    return;
  }

  playSongFromPlaylistDetails(0);
}

function playSongFromPlaylistDetails(index) {
  console.log("=== playSongFromPlaylistDetails called ===");
  console.log("Index:", index);
  console.log("currentPlaylistData:", window.currentPlaylistData);

  if (
    !window.currentPlaylistData ||
    !window.currentPlaylistData.musics ||
    !window.currentPlaylistData.musics[index]
  ) {
    console.error("Playlist data not available or invalid index");
    alert("Erro ao reproduzir música.");
    return;
  }

  const songToPlay = window.currentPlaylistData.musics[index];
  console.log("Song to play:", songToPlay);

  if (
    !songToPlay.src ||
    songToPlay.src === "null" ||
    songToPlay.src === "undefined"
  ) {
    console.error("Song does not have a valid preview URL:", songToPlay);
    alert(
      `A música "${songToPlay.title}" não possui um preview disponível para reprodução.`
    );
    return;
  }

  window.playlist = window.currentPlaylistData.musics;
  window.currentSongIndex = index;

  console.log("Updated window.playlist:", window.playlist);
  console.log("Updated window.currentSongIndex:", window.currentSongIndex);
  console.log("loadSong function available?", typeof loadSong);
  console.log("playSong function available?", typeof playSong);

  if (typeof loadSong === "function") {
    console.log("Calling loadSong...");
    try {
      loadSong(index);
    } catch (error) {
      console.error("Error in loadSong:", error);
      alert("Erro ao carregar a música.");
      return;
    }
  } else {
    console.error("loadSong function not found!");
    alert("Erro: função de carregamento não encontrada.");
    return;
  }

  if (typeof playSong === "function") {
    console.log("Calling playSong...");
    try {
      playSong();
    } catch (error) {
      console.error("Error in playSong:", error);
      alert("Erro ao reproduzir a música.");
    }
  } else {
    console.error("playSong function not found!");
    alert("Erro: função de reprodução não encontrada.");
  }

  console.log("=== playSongFromPlaylistDetails completed ===");
}

window.loadUserPlaylists = loadUserPlaylists;
window.openPlaylist = openPlaylist;
window.deletePlaylist = deletePlaylist;
window.removeMusicFromPlaylist = removeMusicFromPlaylist;
window.playPlaylist = playPlaylist;
window.playSongFromPlaylistDetails = playSongFromPlaylistDetails;
