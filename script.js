const songs = [
  {
    title: "Golden Hour",
    artist: "Sonora Sessions",
    mood: "Warm & dreamy",
    cover: "./assets/images/cover-1.jpg",
    src: "./assets/music/track-1.mp3"
  },
  {
    title: "Ocean Eyes",
    artist: "Sonora Sessions",
    mood: "Calm & atmospheric",
    cover: "./assets/images/cover-2.jpg",
    src: "./assets/music/track-2.mp3"
  },
  {
    title: "Midnight Drive",
    artist: "Sonora Sessions",
    mood: "Late night energy",
    cover: "./assets/images/cover-3.jpg",
    src: "./assets/music/track-3.mp3"
  },
  {
    title: "Afterglow",
    artist: "Sonora Sessions",
    mood: "Soft & uplifting",
    cover: "./assets/images/cover-4.jpg",
    src: "./assets/music/track-4.mp3"
  }
];

const audio = document.getElementById("audioPlayer");

const mainCover = document.getElementById("mainCover");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songMood = document.getElementById("songMood");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const favoriteBtn = document.getElementById("favoriteBtn");
const favoriteCount = document.getElementById("favoriteCount");

const songList = document.getElementById("songList");
const queueList = document.getElementById("queueList");

const searchInput = document.getElementById("searchInput");

const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");

const visualizer = document.getElementById("visualizer");

const toast = document.getElementById("toast");

let currentIndex = 0;
let isPlaying = false;
let shuffle = false;
let repeat = "off";

let favorites =
  JSON.parse(localStorage.getItem("sonoraFavorites")) || [];

let recent =
  JSON.parse(localStorage.getItem("sonoraRecent")) || [];

let currentView = "all";

/* ---------------- UTILITIES ---------------- */

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${min}:${sec}`;
}

function showToast(message) {

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* ---------------- LOAD SONG ---------------- */

function loadSong(index, autoplay = false) {

  currentIndex =
    (index + songs.length) % songs.length;

  const song = songs[currentIndex];

  audio.src = song.src;

  mainCover.src = song.cover;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  songMood.textContent = song.mood;

  document.body.style.setProperty(
    "--player-cover",
    `url("${song.cover}")`
  );

  updateFavoriteButton();

  progress.value = 0;
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";

  renderSongs();
  renderQueue();

  if (autoplay) {
    playSong();
  }
}

/* ---------------- PLAY ---------------- */

async function playSong() {

  try {

    await audio.play();

    isPlaying = true;

    playBtn.textContent = "Ⅱ";

    visualizer.classList.add("active");

    document.querySelector(".player-art-wrap")
      .classList.add("playing");

    addRecent(currentIndex);

  } catch (error) {

    showToast("Unable to play this track");

  }
}

function pauseSong() {

  audio.pause();

  isPlaying = false;

  playBtn.textContent = "▶";

  visualizer.classList.remove("active");

  document.querySelector(".player-art-wrap")
    .classList.remove("playing");
}

/* ---------------- NEXT / PREVIOUS ---------------- */

function nextSong() {

  let next;

  if (shuffle) {

    do {
      next = Math.floor(Math.random() * songs.length);
    } while (
      songs.length > 1 &&
      next === currentIndex
    );

  } else {

    next = currentIndex + 1;

    if (next >= songs.length) {
      next = 0;
    }
  }

  loadSong(next, true);
}

function previousSong() {

  if (audio.currentTime > 4) {

    audio.currentTime = 0;
    return;

  }

  loadSong(currentIndex - 1, true);
}

/* ---------------- FAVORITES ---------------- */

function isFavorite(index) {
  return favorites.includes(index);
}

function toggleFavorite(index = currentIndex) {

  if (isFavorite(index)) {

    favorites = favorites.filter(
      item => item !== index
    );

    showToast("Removed from favorites");

  } else {

    favorites.push(index);

    showToast("Added to favorites ♡");
  }

  localStorage.setItem(
    "sonoraFavorites",
    JSON.stringify(favorites)
  );

  updateFavoriteButton();
  updateStats();
  renderSongs();
}

function updateFavoriteButton() {

  favoriteBtn.textContent =
    isFavorite(currentIndex) ? "♥" : "♡";

  favoriteBtn.classList.toggle(
    "liked",
    isFavorite(currentIndex)
  );
}

/* ---------------- RECENT ---------------- */

function addRecent(index) {

  recent = recent.filter(item => item !== index);

  recent.unshift(index);

  recent = recent.slice(0, 10);

  localStorage.setItem(
    "sonoraRecent",
    JSON.stringify(recent)
  );

  updateStats();
}

/* ---------------- RENDER SONGS ---------------- */

function getVisibleSongs() {

  let list = songs.map((song, index) => ({
    ...song,
    index
  }));

  if (currentView === "favorites") {

    list = list.filter(song =>
      favorites.includes(song.index)
    );

  }

  if (currentView === "recent") {

    list = recent.map(index => ({
      ...songs[index],
      index
    }));

  }

  const query =
    searchInput.value.trim().toLowerCase();

  if (query) {

    list = list.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.mood.toLowerCase().includes(query)
    );

  }

  return list;
}

function renderSongs() {

  const list = getVisibleSongs();

  songList.innerHTML = "";

  list.forEach(song => {

    const card = document.createElement("article");

    card.className =
      `song-card ${
        song.index === currentIndex
          ? "current"
          : ""
      }`;

    card.innerHTML = `
      <img
        class="song-cover"
        src="${song.cover}"
        alt="${song.title}"
      >

      <div class="song-details">
        <strong>${song.title}</strong>
        <small>${song.artist} · ${song.mood}</small>
      </div>

      <div class="song-actions">

        <button
          class="${isFavorite(song.index) ? "liked" : ""}"
          data-favorite="${song.index}"
          title="Favorite"
        >
          ${isFavorite(song.index) ? "♥" : "♡"}
        </button>

        <button
          data-play="${song.index}"
          title="Play"
        >
          ${song.index === currentIndex && isPlaying
            ? "Ⅱ"
            : "▶"}
        </button>

      </div>
    `;

    card.addEventListener("dblclick", () => {
      loadSong(song.index, true);
    });

    songList.appendChild(card);
  });

  document
    .querySelectorAll("[data-play]")
    .forEach(button => {

      button.addEventListener("click", event => {

        const index =
          Number(event.currentTarget.dataset.play);

        if (
          index === currentIndex &&
          isPlaying
        ) {
          pauseSong();
        } else {
          loadSong(index, true);
        }

        renderSongs();
      });

    });

  document
    .querySelectorAll("[data-favorite]")
    .forEach(button => {

      button.addEventListener("click", event => {

        const index =
          Number(event.currentTarget.dataset.favorite);

        toggleFavorite(index);

      });

    });

  document.getElementById("resultCount")
    .textContent =
      `${list.length} ${
        list.length === 1 ? "song" : "songs"
      }`;

  document
    .getElementById("emptyState")
    .classList.toggle(
      "hidden",
      list.length !== 0
    );
}

/* ---------------- QUEUE ---------------- */

function renderQueue() {

  queueList.innerHTML = "";

  songs.forEach((song, index) => {

    const item =
      document.createElement("div");

    item.className = "queue-item";

    item.innerHTML = `
      <img src="${song.cover}" alt="">
      <div>
        <strong>${song.title}</strong>
        <small>${song.artist}</small>
      </div>
    `;

    item.addEventListener("click", () => {
      loadSong(index, true);
    });

    queueList.appendChild(item);
  });
}

/* ---------------- STATS ---------------- */

function updateStats() {

  favoriteCount.textContent =
    favorites.length;

  document.getElementById(
    "statFavorites"
  ).textContent = favorites.length;

  document.getElementById(
    "recentCount"
  ).textContent = recent.length;

  document.getElementById(
    "trackCount"
  ).textContent = songs.length;
}

/* ---------------- PROGRESS ---------------- */

audio.addEventListener("loadedmetadata", () => {

  duration.textContent =
    formatTime(audio.duration);

});

audio.addEventListener("timeupdate", () => {

  if (!audio.duration) return;

  progress.value =
    (audio.currentTime / audio.duration) * 100;

  currentTime.textContent =
    formatTime(audio.currentTime);

});

progress.addEventListener("input", () => {

  if (!audio.duration) return;

  audio.currentTime =
    (progress.value / 100) *
    audio.duration;

});

/* ---------------- CONTROLS ---------------- */

playBtn.addEventListener("click", () => {

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }

});

nextBtn.addEventListener(
  "click",
  nextSong
);

prevBtn.addEventListener(
  "click",
  previousSong
);

audio.addEventListener("ended", () => {

  if (repeat === "one") {

    audio.currentTime = 0;
    playSong();

  } else {

    nextSong();

  }

});

/* ---------------- SHUFFLE ---------------- */

function toggleShuffle() {

  shuffle = !shuffle;

  document
    .getElementById("shuffleBtn")
    .classList.toggle(
      "active",
      shuffle
    );

  showToast(
    shuffle
      ? "Shuffle enabled"
      : "Shuffle disabled"
  );
}

document
  .getElementById("shuffleBtn")
  .addEventListener(
    "click",
    toggleShuffle
  );

document
  .getElementById("shuffleNav")
  .addEventListener(
    "click",
    () => {

      shuffle = true;

      document
        .getElementById("shuffleBtn")
        .classList.add("active");

      nextSong();

      showToast("Shuffle play started");

    }
  );

/* ---------------- REPEAT ---------------- */

document
  .getElementById("repeatBtn")
  .addEventListener("click", () => {

    if (repeat === "off") {
      repeat = "all";
    } else if (repeat === "all") {
      repeat = "one";
    } else {
      repeat = "off";
    }

    const button =
      document.getElementById("repeatBtn");

    button.classList.toggle(
      "active",
      repeat !== "off"
    );

    button.textContent =
      repeat === "one" ? "↻¹" : "↻";

    showToast(
      repeat === "off"
        ? "Repeat off"
        : repeat === "one"
          ? "Repeat current song"
          : "Repeat playlist"
    );

  });

/* ---------------- VOLUME ---------------- */

audio.volume = .8;

volume.addEventListener("input", () => {

  audio.volume = volume.value;

  document.getElementById(
    "muteBtn"
  ).textContent =
    volume.value == 0 ? "🔇" : "🔊";

});

document
  .getElementById("muteBtn")
  .addEventListener("click", () => {

    if (audio.volume > 0) {

      audio.dataset.previousVolume =
        audio.volume;

      audio.volume = 0;
      volume.value = 0;

    } else {

      const old =
        Number(audio.dataset.previousVolume) || .8;

      audio.volume = old;
      volume.value = old;

    }

  });

/* ---------------- SPEED ---------------- */

document
  .getElementById("speedSelect")
  .addEventListener("change", event => {

    audio.playbackRate =
      Number(event.target.value);

    showToast(
      `Playback speed ${event.target.value}×`
    );

  });

/* ---------------- THEME ---------------- */

function setTheme(theme) {

  document.body.classList.toggle(
    "dark",
    theme === "dark"
  );

  themeIcon.textContent =
    theme === "dark" ? "☾" : "☀";

  localStorage.setItem(
    "sonoraTheme",
    theme
  );
}

const savedTheme =
  localStorage.getItem("sonoraTheme") ||
  "light";

setTheme(savedTheme);

themeBtn.addEventListener("click", () => {

  const next =
    document.body.classList.contains("dark")
      ? "light"
      : "dark";

  setTheme(next);

  showToast(
    next === "dark"
      ? "Dark mode enabled"
      : "Light mode enabled"
  );

});

/* ---------------- SEARCH ---------------- */

searchInput.addEventListener(
  "input",
  renderSongs
);

/* ---------------- NAVIGATION ---------------- */

document
  .querySelectorAll(".nav-item[data-view]")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".nav-item")
        .forEach(item =>
          item.classList.remove("active")
        );

      button.classList.add("active");

      currentView =
        button.dataset.view;

      const titles = {
        all: "All Music",
        favorites: "Favorites",
        recent: "Recently Played"
      };

      document.getElementById(
        "pageTitle"
      ).textContent =
        titles[currentView];

      document.getElementById(
        "libraryTitle"
      ).textContent =
        currentView === "all"
          ? "Your Tracks"
          : titles[currentView];

      renderSongs();

    });

  });

/* ---------------- QUEUE PANEL ---------------- */

const queuePanel =
  document.getElementById("queuePanel");

const overlay =
  document.getElementById("overlay");

function openQueue() {

  queuePanel.classList.add("open");
  overlay.classList.add("active");

}

function closeQueue() {

  queuePanel.classList.remove("open");
  overlay.classList.remove("active");

}

document
  .getElementById("queueBtn")
  .addEventListener(
    "click",
    openQueue
  );

document
  .getElementById("closeQueue")
  .addEventListener(
    "click",
    closeQueue
  );

overlay.addEventListener(
  "click",
  closeQueue
);

/* ---------------- SLEEP TIMER ---------------- */

let sleepTimer = null;

function sleepTimerMenu() {

  const answer =
    prompt(
      "Sleep timer:\n\n5 = 5 minutes\n15 = 15 minutes\n30 = 30 minutes\n60 = 60 minutes\n0 = cancel"
    );

  const minutes =
    Number(answer);

  if (!minutes) {

    if (sleepTimer) {
      clearTimeout(sleepTimer);
      sleepTimer = null;
    }

    showToast("Sleep timer cancelled");
    return;
  }

  if (![5,15,30,60].includes(minutes)) {

    showToast("Choose 5, 15, 30 or 60 minutes");
    return;

  }

  clearTimeout(sleepTimer);

  sleepTimer = setTimeout(() => {

    pauseSong();

    showToast("Sleep timer stopped playback");

  }, minutes * 60 * 1000);

  showToast(
    `Sleep timer set for ${minutes} minutes`
  );
}

document
  .getElementById("sleepBtn")
  .addEventListener(
    "click",
    sleepTimerMenu
  );

document
  .getElementById("sleepNav")
  .addEventListener(
    "click",
    sleepTimerMenu
  );

/* ---------------- KEYBOARD ---------------- */

document.addEventListener("keydown", event => {

  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "SELECT"
  ) {
    return;
  }

  if (event.code === "Space") {

    event.preventDefault();

    isPlaying
      ? pauseSong()
      : playSong();

  }

  if (event.key === "ArrowRight") {

    audio.currentTime =
      Math.min(
        audio.currentTime + 5,
        audio.duration || audio.currentTime
      );

  }

  if (event.key === "ArrowLeft") {

    audio.currentTime =
      Math.max(
        audio.currentTime - 5,
        0
      );

  }

  if (event.key === "/") {

    event.preventDefault();

    searchInput.focus();

  }

});

/* ---------------- FAVORITE BUTTON ---------------- */

favoriteBtn.addEventListener(
  "click",
  () => toggleFavorite()
);

/* ---------------- INIT ---------------- */

loadSong(0);

renderSongs();

renderQueue();

updateStats();
