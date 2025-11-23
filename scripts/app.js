/* ==========================
   SISTEMA DE LOGIN LOCAL
===========================*/

async function loadContent(pageName) {
  try {
    const contentContainer = document.getElementById("page-content");

    const response = await fetch(`${pageName}.html`);
    if (!response.ok) throw new Error(`Página não encontrada: ${pageName}.html`);

    const htmlContent = await response.text();
    contentContainer.innerHTML = htmlContent;
  } catch (error) {
    console.error("Erro ao carregar:", error);
    document.getElementById("page-content").innerHTML = "<h2>Erro ao carregar página.</h2>";
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const code = localStorage.getItem("spotify_auth_code");

  if (code) iniciarSpotifyPlayer();

  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (loggedUser && loggedUser.username) {
    if (document.getElementById("page-content")) loadContent("home");
  } else {
    if (!window.location.href.includes("login.html")) {
      window.location.href = "login.html";
    }
  }
});

/* ==========================================
   SISTEMA SPOTIFY (TOKEN + PLAYER)
===========================================*/

let spotifyToken = null;
let spotifyDevice = null;

async function iniciarSpotifyPlayer() {
  try {
    const code = localStorage.getItem("spotify_auth_code");
    if (!code) return;

    const resp = await fetch("http://localhost:3001/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const data = await resp.json();

    spotifyToken = data.access_token;

    carregarSDK();
  } catch (e) {
    console.error("Erro ao buscar token:", e);
  }
}

function carregarSDK() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: "MusicApp Player",
      getOAuthToken: cb => cb(spotifyToken),
      volume: 0.7
    });

    player.on("ready", ({ device_id }) => {
      spotifyDevice = device_id;
      console.log("Player pronto:", device_id);
    });

    player.on("player_state_changed", state => {
      if (!state) return;
      const track = state.track_window.current_track;

      document.querySelector(".song-title").textContent = track.name;
      document.querySelector(".song-artist").textContent =
        track.artists.map(a => a.name).join(", ");

      document.querySelector(".player-album-art").src =
        track.album.images[0].url;
    });

    player.connect();
  };
}

/* Tocar Música */
async function tocarMusica(uri) {
  if (!spotifyDevice) return;

  await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${spotifyDevice}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${spotifyToken}`
      },
      body: JSON.stringify({ uris: [uri] })
    }
  );
}

/* Eventos de clique nos cards */
document.addEventListener("click", ev => {
  const card = ev.target.closest("[data-uri]");
  if (card) tocarMusica(card.dataset.uri);
});
