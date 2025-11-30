// Spotify Configuration
const clientId = 'fc68842aec0d472db11efa1d9be0f458';
// NOTE: The redirect URI must match exactly what is in the Spotify Dashboard.
// Dynamic Redirect URI based on current location
let redirectUri = window.location.origin + window.location.pathname.replace('index.html', 'callback.html').replace(/\/$/, '');
if (redirectUri.endsWith('/html/')) {
    redirectUri += 'callback.html';
}
if (!redirectUri.endsWith('callback.html')) {
    redirectUri = window.location.origin + '/html/callback.html';
}

console.log("Spotify Redirect URI:", redirectUri);

const scopes = [
    'user-top-read',
    'user-read-private',
    'user-read-email'
];

function loginWithSpotify() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&show_dialog=true`;
    window.location.href = authUrl;
}

function logoutSpotify() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiration');
    window.location.reload();
}

function logoutApp() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function fetchWebApi(endpoint, method, body) {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
        console.warn("No Spotify token found.");
        return null;
    }

    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        method,
        body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401) {
        // Token expired or invalid
        console.error("Token expired or invalid. Logging out of Spotify.");
        logoutSpotify();
        return null;
    }

    return await res.json();
}

async function getTopTracks() {
    try {
        const response = await fetchWebApi('v1/me/top/tracks?time_range=long_term&limit=20', 'GET');
        return response ? response.items : [];
    } catch (e) {
        console.error("Erro ao buscar músicas do Spotify:", e);
        return [];
    }
}

async function getSpecificTracks() {
    try {
        // IDs provided by user
        const ids = '7ouMYWpwJ422jRcDASZB7P,4VqPOruhp5EdPBeR92t6lQ,2takcwOaAZWiXQijPHIx7B';
        const response = await fetchWebApi(`v1/tracks?ids=${ids}`, 'GET');
        return response ? response.tracks : [];
    } catch (e) {
        console.error("Erro ao buscar faixas específicas:", e);
        return [];
    }
}

async function getAlbumTracks(albumId) {
    try {
        const response = await fetchWebApi(`v1/albums/${albumId}/tracks?limit=50`, 'GET');
        // We also need album cover which is in the album details
        const albumResponse = await fetchWebApi(`v1/albums/${albumId}`, 'GET');
        const cover = albumResponse && albumResponse.images && albumResponse.images.length > 0 ? albumResponse.images[0].url : '../assets/img1.webp';

        if (response && response.items) {
             return response.items.map(t => ({
                ...t,
                album: { images: [{ url: cover }] }
            }));
        }
        return [];
    } catch (e) {
        console.error("Erro ao buscar álbum:", e);
        return [];
    }
}

async function getArtistTopTracks(artistId) {
    try {
        const response = await fetchWebApi(`v1/artists/${artistId}/top-tracks?market=BR`, 'GET');
        return response ? response.tracks : [];
    } catch (e) {
        console.error("Erro ao buscar top tracks do artista:", e);
        return [];
    }
}

// Global State
let songs = [
    {
        id: 'local_1',
        title: "Kalimba",
        artist: "Mr. Scruff",
        src: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        cover: "../assets/img1.webp"
    },
    {
        id: 'local_2',
        title: "Maid with the Flaxen Hair",
        artist: "Richard Stoltzman",
        src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Classical_Sampler/Kevin_MacLeod_-_Maid_with_the_Flaxen_Hair.mp3",
        cover: "../assets/img1.webp"
    },
    {
        id: 'local_3',
        title: "Sleep Away",
        artist: "Bob Acri",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "../assets/img1.webp"
    }
];


let currentSongIndex = 0;
let isPlaying = false;
let audio = new Audio();
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];


// Player Elements
const playerElements = {
    playBtn: document.getElementById('player-play-btn'),
    playIcon: document.getElementById('player-play-icon'),
    prevBtn: document.getElementById('player-prev-btn'),
    nextBtn: document.getElementById('player-next-btn'),
    shuffleBtn: document.getElementById('player-shuffle-btn'),
    repeatBtn: document.getElementById('player-repeat-btn'),
    progressBar: document.getElementById('player-progress-bar'),
    progressFg: document.getElementById('player-progress-fg'),
    progressHandle: document.getElementById('player-progress-handle'),
    currentTime: document.getElementById('player-current-time'),
    totalTime: document.getElementById('player-total-time'),
    volumeIcon: document.getElementById('player-volume-icon'),
    volumeSlider: document.getElementById('player-volume-slider'),
    volumeFg: document.getElementById('player-volume-fg'),
    albumArt: document.getElementById('player-album-art'),
    songTitle: document.getElementById('player-song-title'),
    songArtist: document.getElementById('player-song-artist'),
    likeBtn: document.getElementById('player-like-btn')
};

// Navigation & Content Loading
async function loadContent(pageName) {
  try {
    const contentContainer = document.getElementById("page-content");

    // Handle dynamic pages
    if (pageName === 'liked-songs') {
        renderLikedSongs(contentContainer);
        return;
    }

    // We are in the html folder, so we need to fetch from the same folder
    const response = await fetch(`${pageName}.html`);

    if (!response.ok) {
      throw new Error(`Página não encontrada: ${pageName}.html`);
    }

    const htmlContent = await response.text();

    contentContainer.innerHTML = htmlContent;

    // Re-attach event listeners for dynamic content if needed
    attachDynamicListeners();

  } catch (error) {
    console.error("Erro ao carregar página:", error);
    document.getElementById("page-content").innerHTML =
      "<h2>Erro ao carregar.</h2>";
  }
}

function renderLikedSongs(container) {
    let html = `
        <section class="content-section">
            <div class="section-header">
                <h3>Músicas Curtidas</h3>
            </div>
            <div class="card-list" style="display: flex; flex-direction: column; gap: 10px;">
    `;

    if (likedSongs.length === 0) {
        html += '<p>Você ainda não curtiu nenhuma música.</p>';
    } else {
        likedSongs.forEach(songId => {
            const song = songs.find(s => s.id === songId);
            if (song) {
                html += `
                    <div class="song-row" onclick="playSongById('${song.id}')" style="display: flex; align-items: center; gap: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; cursor: pointer;">
                        <img src="${song.cover}" style="width: 50px; height: 50px; border-radius: 4px;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: bold;">${song.title}</span>
                            <span style="font-size: 0.9em; opacity: 0.7;">${song.artist}</span>
                        </div>
                        <div style="margin-left: auto;">
                            <i class="fa-solid fa-heart" style="color: #1db954;"></i>
                        </div>
                    </div>
                `;
            }
        });
    }

    html += `
            </div>
        </section>
    `;
    container.innerHTML = html;
}

function attachDynamicListeners() {
    // Attach click to "Músicas Curtidas" card in home
    const likedSongsCard = Array.from(document.querySelectorAll('.quick-card')).find(card => card.innerText.includes('Músicas Curtidas'));
    if (likedSongsCard) {
        likedSongsCard.style.cursor = 'pointer';
        likedSongsCard.onclick = () => loadContent('liked-songs');
    }
}

function renderPlaylists() {
    const container = document.getElementById('user-playlists');
    if (!container) return;

    let html = ``;

    playlists.forEach(pl => {
        // Use a data attribute or closure to handle the click
        html += `<li><a href="#" class="playlist-link" data-name="${pl.name}">${pl.name}</a></li>`;
    });

    container.innerHTML = html;

    // Attach listeners
    container.querySelectorAll('.playlist-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const playlistName = e.target.getAttribute('data-name');
            const playlist = playlists.find(p => p.name === playlistName);
            if (playlist && playlist.songs.length > 0) {
                // Filter songs that are in the global songs list
                const playlistSongs = songs.filter(s => playlist.songs.includes(s.id));

                if (playlistSongs.length > 0) {
                    const firstSongId = playlistSongs[0].id;
                    playSongById(firstSongId);
                    alert(`Reproduzindo playlist: ${playlistName}`);
                } else {
                    alert('Nenhuma música disponível nesta playlist (talvez as músicas não foram carregadas).');
                }
            } else {
                alert('Playlist vazia.');
            }
        };
    });
}

// Player Logic
function loadSong(index) {
    const song = songs[index];
    if (!song) return;

    audio.src = song.src;
    playerElements.songTitle.innerText = song.title;
    playerElements.songArtist.innerText = song.artist;
    playerElements.albumArt.src = song.cover;

    updateLikeButton(song.id);

    // Reset progress
    playerElements.progressFg.style.width = '0%';
    playerElements.progressHandle.style.left = '0%';
    playerElements.currentTime.innerText = '0:00';
}

function playSong() {
    audio.play().catch(e => console.log("Audio play failed (interaction needed?):", e));
    isPlaying = true;
    playerElements.playIcon.classList.remove('fa-play');
    playerElements.playIcon.classList.add('fa-pause');
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    playerElements.playIcon.classList.remove('fa-pause');
    playerElements.playIcon.classList.add('fa-play');
}

function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

function updateProgressBar(e) {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    playerElements.progressFg.style.width = `${progressPercent}%`;
    playerElements.progressHandle.style.left = `${progressPercent}%`;

    // Update time display
    playerElements.currentTime.innerText = formatTime(currentTime);
    playerElements.totalTime.innerText = formatTime(duration);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    audio.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function toggleLike() {
    const currentSong = songs[currentSongIndex];
    if (!currentSong) return;

    const index = likedSongs.indexOf(currentSong.id);

    if (index === -1) {
        likedSongs.push(currentSong.id);
        playerElements.likeBtn.classList.remove('fa-regular');
        playerElements.likeBtn.classList.add('fa-solid');
        playerElements.likeBtn.style.color = '#1db954'; // Green
    } else {
        likedSongs.splice(index, 1);
        playerElements.likeBtn.classList.remove('fa-solid');
        playerElements.likeBtn.classList.add('fa-regular');
        playerElements.likeBtn.style.color = ''; // Default
    }

    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));

    // If we are on the liked songs page, refresh it
    if (document.getElementById('page-content').querySelector('h3')?.innerText === 'Músicas Curtidas') {
        renderLikedSongs(document.getElementById('page-content'));
    }
}

function updateLikeButton(songId) {
    if (likedSongs.includes(songId)) {
        playerElements.likeBtn.classList.remove('fa-regular');
        playerElements.likeBtn.classList.add('fa-solid');
        playerElements.likeBtn.style.color = '#1db954';
    } else {
        playerElements.likeBtn.classList.remove('fa-solid');
        playerElements.likeBtn.classList.add('fa-regular');
        playerElements.likeBtn.style.color = '';
    }
}

function playSongById(id) {
    const index = songs.findIndex(s => s.id === id);
    if (index !== -1) {
        currentSongIndex = index;
        loadSong(currentSongIndex);
        playSong();
    } else {
        console.warn("Song not found:", id);
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    // 1. Check App Auth (Primary)
    const appToken = localStorage.getItem('token');
    const spotifyToken = localStorage.getItem('spotify_access_token');

    const userContainer = document.querySelector('.user-container-header');
    const userNameSpan = userContainer ? userContainer.childNodes[2] : null;

    if (appToken) {
        // User is logged in to the App
        if (userContainer) {
            userContainer.removeAttribute('href');
            userContainer.style.cursor = 'pointer';

            const storedName = localStorage.getItem('username') || "Usuário";
            // Show User Profile
            if (userNameSpan && userNameSpan.nodeType === 3) {
                 userNameSpan.textContent = " " + storedName;
            } else {
                 userContainer.innerHTML = `<div class="user-profile"><i class="fa-solid fa-user"></i></div> ${storedName}`;
            }

            // Logout App
            userContainer.onclick = (event) => {
                event.preventDefault();
                if (confirm('Deseja sair da aplicação?')) {
                    logoutApp();
                }
            };
        }

        // Load Home
        if (document.getElementById('page-content')) {
            loadContent('home');
        }

        // 2. Check Spotify Auth (Secondary)
        if (spotifyToken) {
            console.log("Spotify connected.");

            // Fetch Spotify Music
            const albumIds = [
                '2noRn2Aes5aoNVsU6iWThc', // Future Nostalgia - Dua Lipa
                '4yP0hdKOZPNshxUOjY0cZj', // After Hours - The Weeknd
                '5TP8p4IvcH1WbX2218L6aL'  // A Tábua de Esmeralda - Jorge Ben Jor
            ];

            // Requested Artists
            const ARTISTS = {
                "Tim Maia": "0jOs0wnXCu1bGGP7kh5uIu",
                "Lagum": "5D56dZmhE9DgT01XixdHiD",
                "Imagine Dragons": "53XhwfbYqKCa1cC15pYq2q"
            };

            const albumPromises = albumIds.map(id => getAlbumTracks(id));

            // Helper to fetch artist info
            async function getArtistInfo(artistId) {
                try {
                    return await fetchWebApi(`v1/artists/${artistId}`, 'GET');
                } catch (e) {
                    console.error("Erro ao buscar info do artista:", e);
                    return null;
                }
            }

            // Fetch data for requested artists
            const artistPromises = Object.entries(ARTISTS).map(async ([name, id]) => {
                const info = await getArtistInfo(id);
                const tracks = await getArtistTopTracks(id);
                return { name, id, info, tracks };
            });

            Promise.all([getTopTracks(), getSpecificTracks(), ...albumPromises, ...artistPromises]).then(([topTracks, specificTracks, ...rest]) => {
                // Separate album results from artist results
                const albumsResults = rest.slice(0, albumIds.length);
                const artistsResults = rest.slice(albumIds.length);

                let allTracks = [];

                // Helper to map Spotify track to our format
                const mapTrack = (t, coverUrl) => ({
                    id: t.id,
                    title: t.name,
                    artist: t.artists.map(a => a.name).join(', '),
                    src: t.preview_url,
                    cover: coverUrl || t.album?.images[0]?.url || '../assets/img1.webp'
                });

                // Process Requested Artists
                const artistListContainer = document.querySelector('.artist-list');
                if (artistListContainer) artistListContainer.innerHTML = ''; // Clear static content

                artistsResults.forEach(artistData => {
                    if (artistData.tracks && artistData.tracks.length > 0) {
                        const coverUrl = artistData.info?.images[0]?.url;
                        const mapped = artistData.tracks.filter(t => t.preview_url).map(t => mapTrack(t, t.album?.images[0]?.url)); // Use album cover for tracks

                        allTracks = [...allTracks, ...mapped];
                        updatePlaylist(`Top ${artistData.name}`, mapped.map(s => s.id));

                        // Update UI - Add to "Artistas em Destaque"
                        if (artistListContainer && coverUrl) {
                            const artistCard = document.createElement('div');
                            artistCard.className = 'artist-card';
                            artistCard.innerHTML = `
                                <img src="${coverUrl}" alt="${artistData.name}" class="artist-image" />
                                <span class="card-title">${artistData.name}</span>
                                <span class="card-subtitle">Artista</span>
                            `;
                            // Make it clickable to play their top tracks
                            artistCard.style.cursor = 'pointer';
                            artistCard.onclick = () => {
                                const playlist = playlists.find(p => p.name === `Top ${artistData.name}`);
                                if (playlist && playlist.songs.length > 0) {
                                    playSongById(playlist.songs[0]);
                                    alert(`Reproduzindo Top ${artistData.name}`);
                                }
                            };
                            artistListContainer.appendChild(artistCard);
                        }
                    }
                });

                // Process Specific Tracks
                if (specificTracks && specificTracks.length > 0) {
                    const mapped = specificTracks.filter(t => t.preview_url).map(t => mapTrack(t));
                    allTracks = [...allTracks, ...mapped];
                    updatePlaylist('Destaques', mapped.map(s => s.id));
                }

                // Process Top Tracks
                if (topTracks && topTracks.length > 0) {
                    const mapped = topTracks.filter(t => t.preview_url).map(t => mapTrack(t));
                    allTracks = [...allTracks, ...mapped];
                    updatePlaylist('Top Brasil', mapped.map(s => s.id));
                }

                // Process Album Tracks
                const albumNames = ['Future Nostalgia', 'After Hours', 'A Tábua de Esmeralda'];
                albumsResults.forEach((albumTracks, index) => {
                    if (albumTracks && albumTracks.length > 0) {
                        const mapped = albumTracks.filter(t => t.preview_url).map(t => mapTrack(t, t.album.images[0].url));
                        allTracks = [...allTracks, ...mapped];
                        updatePlaylist(albumNames[index], mapped.map(s => s.id));
                    }
                });

                if (allTracks.length > 0) {
                    const existingIds = new Set(songs.map(s => s.id));
                    allTracks.forEach(track => {
                        if (!existingIds.has(track.id)) {
                            songs.push(track);
                            existingIds.add(track.id);
                        }
                    });
                    localStorage.setItem('playlists', JSON.stringify(playlists));
                }

                renderPlaylists();
            });

        } else {
            console.log("Spotify not connected.");
             const navList = document.querySelector('.sidebar nav ul');
             if (navList) {
                 const connectLi = document.createElement('li');
                 connectLi.innerHTML = '<a href="#" style="color: #1db954;"><i class="fa-brands fa-spotify"></i> Conectar Spotify</a>';
                 connectLi.onclick = (e) => {
                     e.preventDefault();
                     loginWithSpotify();
                 };
                 const divisor = navList.querySelector('.divisor-sidebar');
                 if (divisor) {
                     navList.insertBefore(connectLi, divisor);
                 } else {
                     navList.appendChild(connectLi);
                 }
             }
        }

    } else {
        // User is NOT logged in to App
        if (userContainer) {
            userContainer.setAttribute('href', 'login.html');
            userContainer.innerHTML = '<div class="user-profile"><i class="fa-solid fa-user"></i></div> Entrar';
            userContainer.onclick = null;
        }
    }

    // Initialize Player
    if (document.getElementById('player-play-btn')) {
        playerElements.playBtn.addEventListener('click', togglePlay);
        playerElements.nextBtn.addEventListener('click', nextSong);
        playerElements.prevBtn.addEventListener('click', prevSong);
        playerElements.likeBtn.addEventListener('click', toggleLike);
        audio.addEventListener('timeupdate', updateProgressBar);
        audio.addEventListener('ended', nextSong);
        playerElements.progressBar.addEventListener('click', setProgress);

        loadSong(currentSongIndex);
    }

    renderPlaylists();

    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');
    sidebarLinks.forEach(link => {
        if (link.innerHTML.includes('Músicas Curtidas')) {
            link.onclick = (e) => {
                e.preventDefault();
                loadContent('liked-songs');
            };
        }
        if (link.innerHTML.includes('Criar Playlist')) {
            link.onclick = (e) => {
                e.preventDefault();
                const playlistName = prompt("Nome da nova playlist:");
                if (playlistName) {
                    playlists.push({ name: playlistName, songs: [] });
                    localStorage.setItem('playlists', JSON.stringify(playlists));
                    renderPlaylists();
                    alert(`Playlist "${playlistName}" criada!`);
                }
            };
        }
    });
});

function updatePlaylist(name, songIds) {
    const playlist = playlists.find(p => p.name === name);
    if (!playlist) {
        playlists.push({ name: name, songs: songIds });
    } else {
        const currentIds = new Set(playlist.songs);
        songIds.forEach(id => currentIds.add(id));
        playlist.songs = Array.from(currentIds);
    }
}
