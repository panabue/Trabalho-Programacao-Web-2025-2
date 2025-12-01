document.addEventListener("DOMContentLoaded", () => {
  const audioPlayer = document.getElementById("audio-player");
  const playButton = document.querySelector(".play-button-container i");
  const nextButton = document.querySelector(".fa-forward-step");
  const prevButton = document.querySelector(".fa-backward-step");
  const progressBar = document.querySelector(".progress-bar");
  const progressBarForeground = document.querySelector(".progress-bar-foreground");
  const progressBarHandle = document.querySelector(".progress-bar-handle");
  const timeCurrent = document.querySelector(".time-current");
  const timeTotal = document.querySelector(".time-total");
  const songTitleEl = document.querySelector(".player-song-info .song-title");
  const songArtist = document.querySelector(".song-artist");
  const albumArt = document.querySelector(".player-album-art");
  const likeButton = document.getElementById("like-button");
  const addToPlaylistButton = document.getElementById("add-to-playlist-button");
  const playlistModal = document.getElementById("playlist-modal");
  const closeModalSpan = document.querySelector(".close-modal");
  const playlistListModal = document.getElementById("playlist-list-modal");

  const playlist = [
    {
        title: "HIGHEST IN THE ROOM",
        artist: "Travis Scott",
        src: "../assets/music/travis/Travis Scott - HIGHEST IN THE ROOM (Official Music Video) [tfSS1e3kYeo].mp3",
        albumArt: "../assets/img2.jpg",
        spotifyId: "local-travis-highest"
    },
    {
        title: "Não Quero Dinheiro",
        artist: "Tim Maia",
        src: "../assets/music/timMaia/Tim Maia - Não Quero Dinheiro (Só Quero Amar) [_HLsxDQ_98s].mp3",
        albumArt: "../assets/img3.jpg",
        spotifyId: "local-tim-naoquerodinheiro"
    },
    {
        title: "Scar Tissue",
        artist: "Red Hot Chili Peppers",
        src: "../assets/music/rhcp/Red Hot Chili Peppers - Scar Tissue [Official Music Video] [HD UPGRADE] [mzJj5-lubeM].mp3",
        albumArt: "../assets/img4.jpg",
        spotifyId: "local-rhcp-scartissue"
    },
    {
        title: "Get Lucky",
        artist: "Daft Punk",
        src: "../assets/music/daftPunk/Daft Punk - Get Lucky (Official Video) feat. Pharrell Williams and Nile Rodgers [CCHdMIEGaaM].mp3",
        albumArt: "../assets/img5.jpg",
        spotifyId: "local-daftpunk-getlucky"
    },
  ];

  window.playlist = playlist;

  let currentSongIndex = 0;
  let isPlaying = false;

  function loadSong(songIndex) {
    const song = playlist[songIndex];
    audioPlayer.src = song.src;
    songTitleEl.textContent = song.title;
    songArtist.textContent = song.artist;
    albumArt.src = song.albumArt;
    checkIfLiked(song);
  }

  function playSong() {
    isPlaying = true;
    playButton.classList.remove("fa-play");
    playButton.classList.add("fa-pause");
    audioPlayer.play();
  }

  function pauseSong() {
    isPlaying = false;
    playButton.classList.remove("fa-pause");
    playButton.classList.add("fa-play");
    audioPlayer.pause();
  }

  function togglePlayPause() {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }

  function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    playSong();
  }

  function playPrevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    playSong();
  }

  function updateProgressBar() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressBarForeground.style.width = `${progressPercent}%`;
    progressBarHandle.style.left = `${progressPercent}%`;
    timeCurrent.textContent = formatTime(currentTime);
    if (duration) {
      timeTotal.textContent = formatTime(duration);
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function seek(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
  }

  function playSongFromPlaylist(songTitle) {
    const songIndex = window.playlist.findIndex(song => song.title === songTitle);
    if (songIndex !== -1) {
        currentSongIndex = songIndex;
        loadSong(currentSongIndex);
        playSong();
    }
  }

  // Export functions to window for use in other scripts
  window.playSongFromPlaylist = playSongFromPlaylist;
  window.loadSong = loadSong;
  window.playSong = playSong;
  window.pauseSong = pauseSong;

  // Export currentSongIndex as a getter/setter
  Object.defineProperty(window, 'currentSongIndex', {
    get: function() { return currentSongIndex; },
    set: function(value) { currentSongIndex = value; }
  });

  // --- Like Functionality ---

  async function toggleLike() {
    const currentSong = playlist[currentSongIndex];
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Você precisa estar logado para curtir músicas.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8081/music/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: currentSong.title,
                artist: currentSong.artist,
                spotifyId: currentSong.spotifyId,
                coverUrl: currentSong.albumArt,
                previewUrl: currentSong.src
            })
        });

        if (response.ok) {
            if (likeButton.classList.contains('fa-regular')) {
                likeButton.classList.remove('fa-regular');
                likeButton.classList.add('fa-solid');
            } else {
                likeButton.classList.remove('fa-solid');
                likeButton.classList.add('fa-regular');
            }
        } else {
            if (response.status === 403 || response.status === 401) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            console.error("Failed to toggle like");
        }
    } catch (error) {
        console.error("Erro ao curtir música:", error);
    }
  }

  async function checkIfLiked(song) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8081/music/liked', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const likedMusics = await response.json();
            const isLiked = likedMusics.some(m => m.spotifyId === song.spotifyId);
            if (isLiked) {
                likeButton.classList.remove('fa-regular');
                likeButton.classList.add('fa-solid');
            } else {
                likeButton.classList.remove('fa-solid');
                likeButton.classList.add('fa-regular');
            }
        } else if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
    } catch (error) {
        console.error("Erro ao verificar curtidas:", error);
    }
  }

  // --- Playlist Functionality ---

  function openPlaylistModal() {
      fetchPlaylistsForModal();
      playlistModal.style.display = "block";
  }

  function closePlaylistModal() {
      playlistModal.style.display = "none";
  }

  async function fetchPlaylistsForModal() {
      const token = localStorage.getItem('token');
      if (!token) {
          alert("Você precisa estar logado para adicionar à playlist.");
          closePlaylistModal();
          return;
      }

      try {
          const response = await fetch('http://localhost:8081/playlist', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (response.ok) {
              const playlists = await response.json();
              playlistListModal.innerHTML = '';
              if (playlists.length === 0) {
                  playlistListModal.innerHTML = '<li style="padding: 10px; color: #aaa;">Nenhuma playlist encontrada. Crie uma primeiro!</li>';
              } else {
                  playlists.forEach(pl => {
                      const li = document.createElement('li');
                      li.textContent = pl.name;
                      li.style.padding = "10px";
                      li.style.cursor = "pointer";
                      li.style.borderBottom = "1px solid #333";
                      li.onmouseover = () => li.style.backgroundColor = "#333";
                      li.onmouseout = () => li.style.backgroundColor = "transparent";
                      li.onclick = () => addSongToPlaylist(pl.id);
                      playlistListModal.appendChild(li);
                  });
              }
          } else {
              if (response.status === 403 || response.status === 401) {
                  alert("Sessão expirada. Por favor, faça login novamente.");
                  localStorage.removeItem('token');
                  window.location.href = 'login.html';
                  return;
              }
              playlistListModal.innerHTML = '<li style="padding: 10px; color: red;">Erro ao carregar playlists.</li>';
          }
      } catch (error) {
          console.error("Erro ao buscar playlists:", error);
          playlistListModal.innerHTML = '<li style="padding: 10px; color: red;">Erro de conexão.</li>';
      }
  }

  async function addSongToPlaylist(playlistId) {
    let songData;

    // Check if we're adding from the liked songs page
    if (window.currentSongToAdd) {
        songData = window.currentSongToAdd;
    } else {
        // Otherwise, use the current song from the player
        const currentSong = playlist[currentSongIndex];
        songData = {
            title: currentSong.title,
            artist: currentSong.artist,
            spotifyId: currentSong.spotifyId,
            coverUrl: currentSong.albumArt,
            previewUrl: currentSong.src
        };
    }

    console.log("=== Adding song to playlist ===");
    console.log("Playlist ID:", playlistId);
    console.log("Song data being sent:", songData);

    const token = localStorage.getItem('token');

    try {
        const requestBody = {
            title: songData.title,
            artist: songData.artist,
            spotifyId: songData.spotifyId,
            coverUrl: songData.coverUrl,
            previewUrl: songData.previewUrl
        };

        console.log("Request body:", requestBody);

        const response = await fetch(`http://localhost:8081/playlist/${playlistId}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            console.log("Song added successfully!");
            alert("Música adicionada à playlist com sucesso!");
            closePlaylistModal();
            // Clear the temporary song data
            window.currentSongToAdd = null;
        } else {
            if (response.status === 403 || response.status === 401) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            const errorText = await response.text();
            console.error("Error adding song:", errorText);
            alert("Erro ao adicionar música à playlist.");
        }
    } catch (error) {
        console.error("Erro ao adicionar à playlist:", error);
    }
}

  playButton.addEventListener("click", togglePlayPause);
  nextButton.addEventListener("click", playNextSong);
  prevButton.addEventListener("click", playPrevSong);
  audioPlayer.addEventListener("timeupdate", updateProgressBar);
  progressBar.addEventListener("click", seek);
  audioPlayer.addEventListener("ended", playNextSong);

  if (likeButton) {
      likeButton.addEventListener("click", toggleLike);
  }

  if (addToPlaylistButton) {
      addToPlaylistButton.addEventListener("click", openPlaylistModal);
  }

  if (closeModalSpan) {
      closeModalSpan.addEventListener("click", closePlaylistModal);
  }

  window.onclick = function(event) {
      if (event.target == playlistModal) {
          closePlaylistModal();
      }
  }

  loadSong(currentSongIndex);
});
