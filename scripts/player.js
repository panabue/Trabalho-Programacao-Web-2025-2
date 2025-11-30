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
  const songTitle = document.querySelector(".song-title");
  const songArtist = document.querySelector(".song-artist");
  const albumArt = document.querySelector(".player-album-art");

  const playlist = [
    {
        title: "HIGHEST IN THE ROOM",
        artist: "Travis Scott",
        src: "../assets/music/travis/Travis Scott - HIGHEST IN THE ROOM (Official Music Video) [tfSS1e3kYeo].mp3",
        albumArt: "../assets/img2.jpg",
    },
    {
        title: "Não Quero Dinheiro",
        artist: "Tim Maia",
        src: "../assets/music/timMaia/Tim Maia - Não Quero Dinheiro (Só Quero Amar) [_HLsxDQ_98s].mp3",
        albumArt: "../assets/img3.jpg",
    },
    {
        title: "Scar Tissue",
        artist: "Red Hot Chili Peppers",
        src: "../assets/music/rhcp/Red Hot Chili Peppers - Scar Tissue [Official Music Video] [HD UPGRADE] [mzJj5-lubeM].mp3",
        albumArt: "../assets/img4.jpg",
    },
    {
        title: "Get Lucky",
        artist: "Daft Punk",
        src: "../assets/music/daftPunk/Daft Punk - Get Lucky (Official Video) feat. Pharrell Williams and Nile Rodgers [CCHdMIEGaaM].mp3",
        albumArt: "../assets/img5.jpg",
    },
  ];

  let currentSongIndex = 0;
  let isPlaying = false;

  function loadSong(songIndex) {
    const song = playlist[songIndex];
    audioPlayer.src = song.src;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumArt.src = song.albumArt;
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
    timeTotal.textContent = formatTime(duration);
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

  playButton.addEventListener("click", togglePlayPause);
  nextButton.addEventListener("click", playNextSong);
  prevButton.addEventListener("click", playPrevSong);
  audioPlayer.addEventListener("timeupdate", updateProgressBar);
  progressBar.addEventListener("click", seek);
  audioPlayer.addEventListener("ended", playNextSong);

  loadSong(currentSongIndex);
});
