// Liked Songs - Gerenciamento de Músicas Curtidas

async function loadLikedSongs() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Você precisa estar logado para ver suas músicas curtidas.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8081/music/liked', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const likedMusics = await response.json();
            displayLikedSongs(likedMusics);
        } else if (response.status === 403 || response.status === 401) {
            alert("Sessão expirada. Por favor, faça login novamente.");
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        } else {
            console.error("Erro ao carregar músicas curtidas");
            displayLikedSongs([]);
        }
    } catch (error) {
        console.error("Erro ao carregar músicas curtidas:", error);
        displayLikedSongs([]);
    }
}

function displayLikedSongs(songs) {
    const container = document.querySelector('.liked-songs-list');
    const countElement = document.querySelector('.liked-songs-count');

    if (!container) return;

    // Update count
    if (countElement) {
        countElement.textContent = `${songs.length} ${songs.length === 1 ? 'música' : 'músicas'}`;
    }

    if (songs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-heart-crack"></i>
                <h3>Nenhuma música curtida ainda</h3>
                <p>Curta suas músicas favoritas para vê-las aqui!</p>
            </div>
        `;
        return;
    }

    // Create table structure
    let html = `
        <table class="songs-table">
            <thead>
                <tr>
                    <th class="song-number">#</th>
                    <th class="song-title">Título</th>
                    <th class="song-album">Álbum</th>
                    <th class="song-actions">Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    songs.forEach((song, index) => {
        html += `
            <tr class="song-row" data-song-index="${index}">
                <td class="song-number">
                    <span class="number">${index + 1}</span>
                    <button class="play-song-btn" onclick="playSongFromLiked(${index})">
                        <i class="fa-solid fa-play"></i>
                    </button>
                </td>
                <td class="song-title">
                    <div class="song-info">
                        ${song.coverUrl ? `<img src="${song.coverUrl}" alt="${song.title}" class="song-cover">` : ''}
                        <div class="song-details">
                            <div class="song-name">${song.title || 'Sem título'}</div>
                            <div class="song-artist">${song.artist || 'Artista desconhecido'}</div>
                        </div>
                    </div>
                </td>
                <td class="song-album">${song.album || '-'}</td>
                <td class="song-actions">
                    <button class="action-btn unlike-btn" onclick="unlikeSong('${song.id}', '${song.spotifyId}')" title="Descurtir">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    <button class="action-btn add-to-playlist-btn" onclick="openAddToPlaylistModal('${song.id}', '${song.spotifyId}')" title="Adicionar à playlist">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;

    // Store liked songs globally for playback
    window.likedSongsPlaylist = songs.map(song => ({
        title: song.title,
        artist: song.artist,
        album: song.album,
        src: song.previewUrl,
        albumArt: song.coverUrl,
        spotifyId: song.spotifyId
    }));
}

function playSongFromLiked(index) {
    if (!window.likedSongsPlaylist || !window.likedSongsPlaylist[index]) {
        alert("Erro ao reproduzir música.");
        return;
    }

    // Update global playlist
    window.playlist = window.likedSongsPlaylist;
    window.currentSongIndex = index;

    // Load and play the song
    if (typeof loadSong === 'function') {
        loadSong(index);
    }
    if (typeof playSong === 'function') {
        playSong();
    }
}

function playAllLikedSongs() {
    if (!window.likedSongsPlaylist || window.likedSongsPlaylist.length === 0) {
        alert("Você não tem músicas curtidas para reproduzir.");
        return;
    }

    playSongFromLiked(0);
}

async function unlikeSong(musicId, spotifyId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Você precisa estar logado.");
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
                spotifyId: spotifyId
            })
        });

        if (response.ok) {
            // Reload liked songs
            loadLikedSongs();
        } else {
            if (response.status === 403 || response.status === 401) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            console.error("Erro ao descurtir música");
        }
    } catch (error) {
        console.error("Erro ao descurtir música:", error);
        alert("Erro ao descurtir música.");
    }
}

async function openAddToPlaylistModal(musicId, spotifyId) {
    // This function will open the playlist modal
    // We need to store the current song data
    window.currentSongToAdd = {
        id: musicId,
        spotifyId: spotifyId
    };

    // Find the song in the liked songs list
    const song = window.likedSongsPlaylist.find(s => s.spotifyId === spotifyId);
    if (song) {
        window.currentSongToAdd = {
            ...window.currentSongToAdd,
            title: song.title,
            artist: song.artist,
            album: song.album,
            coverUrl: song.albumArt,
            previewUrl: song.src
        };
    }

    // Call the existing modal function from player.js
    if (typeof openPlaylistModal === 'function') {
        openPlaylistModal();
    }
}

// Export functions to window
window.loadLikedSongs = loadLikedSongs;
window.playSongFromLiked = playSongFromLiked;
window.playAllLikedSongs = playAllLikedSongs;
window.unlikeSong = unlikeSong;
window.openAddToPlaylistModal = openAddToPlaylistModal;
