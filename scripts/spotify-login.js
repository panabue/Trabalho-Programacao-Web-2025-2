// REDIRECT AJUSTADO — TEM QUE SER ESTE:
const redirectUri = "http://127.0.0.1:5500/callback.html";

// CLIENT ID REAL que você me enviou
const clientId = "fc68842aec0d472db11efa1d9be0f458";

// scopes para permitir Web Playback
const scopes = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state"
];

document.getElementById("spotify-login").addEventListener("click", () => {
    const authUrl =
      "https://accounts.spotify.com/authorize" +
      `?client_id=${clientId}` +
      "&response_type=code" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(" "))}`;

    window.location.href = authUrl;
});
