/* =========================================================
   SONORA MUSIC PLAYER
   Pure JavaScript
========================================================= */

"use strict";


/* =========================================================
   SONG DATA
   IMPORTANT:
   These paths match the user's existing folders.
========================================================= */

const songs = [
  {
    id: 1,
    title: "Golden Hour",
    artist: "Sonora Sessions",
    description: "Warm & dreamy",
    cover: "assets/images/cover-1.jpg",
    audio: "assets/music/track-1.mp3"
  },

  {
    id: 2,
    title: "Midnight Drive",
    artist: "Sonora Sessions",
    description: "Late night energy",
    cover: "assets/images/cover-2.jpg",
    audio: "assets/music/track-2.mp3"
  },

  {
    id: 3,
    title: "Ocean Eyes",
    artist: "Sonora Sessions",
    description: "Calm & atmospheric",
    cover: "assets/images/cover-3.jpg",
    audio: "assets/music/track-3.mp3"
  },

  {
    id: 4,
    title: "Afterglow",
    artist: "Sonora Sessions",
    description: "Soft electronic mood",
    cover: "assets/images/cover-4.jpg",
    audio: "assets/music/track-4.mp3"
  }
];


/* =========================================================
   DOM
========================================================= */

const audio = document.getElementById("audioPlayer");

const mainCover = document.getElementById("mainCover");
const miniCover = document.getElementById("miniCover");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const songDescription = document.getElementById("songDescription");

const miniTitle = document.getElementById("miniTitle");
const miniArtist = document.getElementById("miniArtist");

const playBtn = document.getElementById("playBtn");
const miniPlay = document.getElementById("miniPlay");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const miniPrev = document.getElementById("miniPrev");
const miniNext = document.getElementById("miniNext");

const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const favoriteBtn = document.getElementById("favoriteBtn");

const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");

const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const volumeIcon = document.getElementById("volumeIcon");

const speedSelect = document.getElementById("speedSelect");

const trackList = document.getElementById("trackList");
const trackCount = document.getElementById("trackCount");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");

const themeBtn = document.getElementById("themeBtn");

const albumWrap = document.getElementById("albumWrap");
const visualizer = document.getElementById("visualizer");

const miniProgress = document.getElementById("miniProgress");

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");


/* =========================================================
   STATE
========================================================= */

let currentIndex = 0;

let isPlaying = false;
let isShuffle = false;
let repeatMode = false;

let favorites = JSON.parse(
  localStorage.getItem("sonoraFavorites") || "[]"
);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadTheme();

  audio.volume = 0.8;

  renderTracks(songs);

  loadSong(0);

  updateVolumeUI();

});


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index) {

  if (!songs[index]) {
    index = 0;
  }

  currentIndex = index;

  const song = songs[currentIndex];

  audio.src = song.audio;

  audio.load();

  mainCover.src = song.cover;
  miniCover.src = song.cover;

  songTitle.textContent = song.title;
  artistName.textContent = song.artist;
  songDescription.textContent = song.description;

  miniTitle.textContent = song.title;
  miniArtist.textContent = song.artist;

  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  progressBar.value = 0;

  updateProgressBackground(0);

  updateFavoriteButton();

  updateActiveTrack();

}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }

}


function playSong() {

  const playPromise = audio.play();

  if (playPromise !== undefined) {

    playPromise
      .then(() => {

        isPlaying = true;

        updatePlayButtons();

        albumWrap.classList.add("playing");

        visualizer.classList.add("active");

      })
      .catch((error) => {

        console.error("Audio playback error:", error);

        showToast(
          "Audio could not play. Check the MP3 file path."
        );

      });

  }

}


function pauseSong() {

  audio.pause();

  isPlaying = false;

  updatePlayButtons();

  albumWrap.classList.remove("playing");

  visualizer.classList.remove("active");

}


/* =========================================================
   PLAY BUTTON UI
========================================================= */

function updatePlayButtons() {

  const icon = isPlaying ? "❚❚" : "▶";

  playBtn.textContent = icon;
  miniPlay.textContent = icon;

  playBtn.setAttribute(
    "aria-label",
    isPlaying ? "Pause" : "Play"
  );

}


/* =========================================================
   NEXT
========================================================= */

function nextSong() {

  let nextIndex;

  if (isShuffle) {

    if (songs.length <= 1) {
      nextIndex = currentIndex;
    } else {

      do {
        nextIndex = Math.floor(
          Math.random() * songs.length
        );
      } while (nextIndex === currentIndex);

    }

  } else {

    nextIndex =
      (currentIndex + 1) % songs.length;

  }

  loadSong(nextIndex);

  playSong();

}


/* =========================================================
   PREVIOUS
========================================================= */

function previousSong() {

  if (audio.currentTime > 3) {

    audio.currentTime = 0;
    return;

  }

  const previousIndex =
    (currentIndex - 1 + songs.length) % songs.length;

  loadSong(previousIndex);

  playSong();

}


/* =========================================================
   AUDIO ENDED
========================================================= */

audio.addEventListener("ended", () => {

  if (repeatMode) {

    audio.currentTime = 0;

    playSong();

  } else {

    nextSong();

  }

});


/* =========================================================
   PROGRESS
========================================================= */

audio.addEventListener("loadedmetadata", () => {

  if (!Number.isNaN(audio.duration)) {

    durationEl.textContent =
      formatTime(audio.duration);

  }

});


audio.addEventListener("timeupdate", () => {

  if (!audio.duration) {
    return;
  }

  const percentage =
    (audio.currentTime / audio.duration) * 100;

  progressBar.value = percentage;

  currentTimeEl.textContent =
    formatTime(audio.currentTime);

  updateProgressBackground(percentage);

  miniProgress.style.width =
    `${percentage}%`;

});


progressBar.addEventListener("input", () => {

  if (!audio.duration) {
    return;
  }

  const percentage =
    Number(progressBar.value);

  audio.currentTime =
    (percentage / 100) * audio.duration;

  updateProgressBackground(percentage);

});


function updateProgressBackground(value) {

  progressBar.style.background = `
    linear-gradient(
      to right,
      var(--accent) 0%,
      var(--accent) ${value}%,
      var(--line) ${value}%,
      var(--line) 100%
    )
  `;

}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    Math.floor(seconds % 60);

  return `${minutes}:${String(remaining).padStart(2, "0")}`;

}


/* =========================================================
   VOLUME
========================================================= */

volumeBar.addEventListener("input", () => {

  audio.volume =
    Number(volumeBar.value);

  updateVolumeUI();

});


function updateVolumeUI() {

  const volume =
    Number(volumeBar.value);

  if (volume === 0) {

    volumeIcon.textContent = "🔇";

  } else if (volume < 0.5) {

    volumeIcon.textContent = "🔉";

  } else {

    volumeIcon.textContent = "🔊";

  }

}


/* =========================================================
   SPEED
========================================================= */

speedSelect.addEventListener("change", () => {

  audio.playbackRate =
    Number(speedSelect.value);

});


/* =========================================================
   SHUFFLE
========================================================= */

shuffleBtn.addEventListener("click", () => {

  isShuffle = !isShuffle;

  shuffleBtn.classList.toggle(
    "active",
    isShuffle
  );

  showToast(
    isShuffle
      ? "Shuffle enabled"
      : "Shuffle disabled"
  );

});


/* =========================================================
   REPEAT
========================================================= */

repeatBtn.addEventListener("click", () => {

  repeatMode = !repeatMode;

  repeatBtn.classList.toggle(
    "active",
    repeatMode
  );

  showToast(
    repeatMode
      ? "Repeat enabled"
      : "Repeat disabled"
  );

});


/* =========================================================
   FAVORITES
========================================================= */

favoriteBtn.addEventListener("click", () => {

  const id = songs[currentIndex].id;

  if (favorites.includes(id)) {

    favorites =
      favorites.filter(
        favoriteId => favoriteId !== id
      );

    showToast("Removed from favorites");

  } else {

    favorites.push(id);

    showToast("Added to favorites");

  }

  localStorage.setItem(
    "sonoraFavorites",
    JSON.stringify(favorites)
  );

  updateFavoriteButton();

  renderTracks(
    getFilteredSongs()
  );

});


function updateFavoriteButton() {

  const id = songs[currentIndex].id;

  const isFavorite =
    favorites.includes(id);

  favoriteBtn.textContent =
    isFavorite ? "♥" : "♡";

  favoriteBtn.classList.toggle(
    "active",
    isFavorite
  );

}


/* =========================================================
   TRACK LIST
========================================================= */

function renderTracks(list) {

  trackList.innerHTML = "";

  trackCount.textContent =
    `${list.length} ${list.length === 1 ? "song" : "songs"}`;


  if (list.length === 0) {

    emptyState.classList.add("show");

    return;

  }


  emptyState.classList.remove("show");


  list.forEach((song) => {

    const realIndex =
      songs.findIndex(
        item => item.id === song.id
      );

    const card =
      document.createElement("div");

    card.className = "track-card";

    card.dataset.index = realIndex;


    if (realIndex === currentIndex) {
      card.classList.add("active");
    }


    const isFavorite =
      favorites.includes(song.id);


    card.innerHTML = `
      <span class="track-number">
        ${String(song.id).padStart(2, "0")}
      </span>

      <img
        class="track-cover"
        src="${song.cover}"
        alt="${escapeHTML(song.title)}"
      >

      <div class="track-details">

        <div class="track-title">
          ${escapeHTML(song.title)}
        </div>

        <div class="track-artist">
          ${escapeHTML(song.artist)}
        </div>

      </div>

      <span class="track-duration">
        ${isFavorite ? "♥" : ""}
      </span>

      <button
        class="track-play"
        type="button"
        aria-label="Play ${escapeHTML(song.title)}"
      >
        ${
          realIndex === currentIndex && isPlaying
            ? "❚❚"
            : "▶"
        }
      </button>
    `;


    card.addEventListener("click", (event) => {

      if (
        event.target.closest(".track-play")
        || !event.target.closest("button")
      ) {

        loadSong(realIndex);

        playSong();

      }

    });


    trackList.appendChild(card);

  });

}


/* =========================================================
   ACTIVE TRACK
========================================================= */

function updateActiveTrack() {

  document
    .querySelectorAll(".track-card")
    .forEach(card => {

      const index =
        Number(card.dataset.index);

      const active =
        index === currentIndex;

      card.classList.toggle(
        "active",
        active
      );

      const playButton =
        card.querySelector(".track-play");

      if (playButton) {

        playButton.textContent =
          active && isPlaying
            ? "❚❚"
            : "▶";

      }

    });

}


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener("input", () => {

  renderTracks(
    getFilteredSongs()
  );

});


function getFilteredSongs() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  if (!query) {
    return songs;
  }

  return songs.filter(song =>

    song.title
      .toLowerCase()
      .includes(query)

    ||

    song.artist
      .toLowerCase()
      .includes(query)

    ||

    song.description
      .toLowerCase()
      .includes(query)

  );

}


/* =========================================================
   THEME
========================================================= */

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const dark =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "sonoraTheme",
    dark ? "dark" : "light"
  );

  updateThemeIcon();

});


function loadTheme() {

  const savedTheme =
    localStorage.getItem("sonoraTheme");

  if (savedTheme === "dark") {

    document.body.classList.add("dark");

  }

  updateThemeIcon();

}


function updateThemeIcon() {

  themeBtn.textContent =
    document.body.classList.contains("dark")
      ? "☾"
      : "☼";

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener("keydown", (event) => {

  const tag =
    document.activeElement?.tagName;

  if (
    tag === "INPUT" ||
    tag === "SELECT" ||
    tag === "TEXTAREA"
  ) {
    return;
  }


  if (event.code === "Space") {

    event.preventDefault();

    togglePlay();

  }


  if (event.key === "ArrowRight") {

    nextSong();

  }


  if (event.key === "ArrowLeft") {

    previousSong();

  }


  if (event.key === "/") {

    event.preventDefault();

    searchInput.focus();

  }

});


/* =========================================================
   BUTTON EVENTS
========================================================= */

playBtn.addEventListener(
  "click",
  togglePlay
);

miniPlay.addEventListener(
  "click",
  togglePlay
);

nextBtn.addEventListener(
  "click",
  nextSong
);

miniNext.addEventListener(
  "click",
  nextSong
);

prevBtn.addEventListener(
  "click",
  previousSong
);

miniPrev.addEventListener(
  "click",
  previousSong
);


/* =========================================================
   AUDIO ERROR
========================================================= */

audio.addEventListener("error", () => {

  console.error(
    "Audio file could not be loaded:",
    audio.src
  );

  showToast(
    "Check that the MP3 file exists in assets/music/"
  );

});


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {

  toastText.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
