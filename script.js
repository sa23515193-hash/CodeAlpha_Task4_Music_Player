/* =========================================================
   SONORA MUSIC PLAYER
   Pure JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SONG DATA
       ===================================================== */

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


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const audio = document.getElementById("audioPlayer");

    const mainCover =
        document.getElementById("mainCover");

    const songTitle =
        document.getElementById("songTitle");

    const songArtist =
        document.getElementById("songArtist");

    const songMood =
        document.getElementById("songMood");

    const playButton =
        document.getElementById("playButton");

    const previousButton =
        document.getElementById("previousButton");

    const nextButton =
        document.getElementById("nextButton");

    const shuffleButton =
        document.getElementById("shuffleButton");

    const repeatButton =
        document.getElementById("repeatButton");

    const progressBar =
        document.getElementById("progressBar");

    const currentTime =
        document.getElementById("currentTime");

    const duration =
        document.getElementById("duration");

    const volumeBar =
        document.getElementById("volumeBar");

    const volumeValue =
        document.getElementById("volumeValue");

    const volumeIcon =
        document.getElementById("volumeIcon");

    const playlist =
        document.getElementById("playlist");

    const searchInput =
        document.getElementById("searchInput");

    const favoriteButton =
        document.getElementById("favoriteButton");

    const themeButton =
        document.getElementById("themeButton");

    const toast =
        document.getElementById("toast");


    /* =====================================================
       STATE
       ===================================================== */

    let currentIndex = 0;

    let isPlaying = false;

    let isShuffle = false;

    let repeatMode = 0;

    let likedSongs =
        JSON.parse(
            localStorage.getItem("sonoraLikedSongs")
        ) || [];


    /* =====================================================
       INITIAL SETUP
       ===================================================== */

    audio.volume = 0.8;

    renderPlaylist();

    loadSong(0);

    updateFavoriteButton();


    /* =====================================================
       LOAD SONG
       ===================================================== */

    function loadSong(index) {

        if (index < 0) {
            index = songs.length - 1;
        }

        if (index >= songs.length) {
            index = 0;
        }

        currentIndex = index;

        const song = songs[currentIndex];

        audio.src = song.src;

        mainCover.src = song.cover;

        mainCover.alt =
            `${song.title} album cover`;

        songTitle.textContent =
            song.title;

        songArtist.textContent =
            song.artist;

        songMood.textContent =
            song.mood;

        progressBar.value = 0;

        currentTime.textContent =
            "0:00";

        duration.textContent =
            "0:00";

        updatePlaylistActive();

        updateFavoriteButton();

        document.title =
            `${song.title} — Sonora`;
    }


    /* =====================================================
       PLAY
       ===================================================== */

    function playSong() {

        const playPromise =
            audio.play();

        if (playPromise !== undefined) {

            playPromise
                .then(() => {

                    isPlaying = true;

                    updatePlayButton();

                    showToast(
                        `Playing ${songs[currentIndex].title}`
                    );

                })
                .catch(() => {

                    showToast(
                        "Audio file could not be played."
                    );

                });
        }
    }


    /* =====================================================
       PAUSE
       ===================================================== */

    function pauseSong() {

        audio.pause();

        isPlaying = false;

        updatePlayButton();
    }


    /* =====================================================
       PLAY / PAUSE
       ===================================================== */

    playButton.addEventListener(
        "click",
        () => {

            if (isPlaying) {
                pauseSong();
            } else {
                playSong();
            }

        }
    );


    /* =====================================================
       UPDATE PLAY BUTTON
       ===================================================== */

    function updatePlayButton() {

        playButton.textContent =
            isPlaying ? "Ⅱ" : "▶";

        playButton.title =
            isPlaying ? "Pause" : "Play";
    }


    /* =====================================================
       NEXT SONG
       ===================================================== */

    function nextSong() {

        if (isShuffle) {

            let randomIndex;

            do {

                randomIndex =
                    Math.floor(
                        Math.random() *
                        songs.length
                    );

            } while (
                randomIndex === currentIndex &&
                songs.length > 1
            );

            currentIndex = randomIndex;

        } else {

            currentIndex++;

            if (
                currentIndex >=
                songs.length
            ) {
                currentIndex = 0;
            }

        }

        loadSong(currentIndex);

        playSong();
    }


    nextButton.addEventListener(
        "click",
        nextSong
    );


    /* =====================================================
       PREVIOUS SONG
       ===================================================== */

    previousButton.addEventListener(
        "click",
        () => {

            if (audio.currentTime > 3) {

                audio.currentTime = 0;

                return;
            }

            currentIndex--;

            if (currentIndex < 0) {
                currentIndex =
                    songs.length - 1;
            }

            loadSong(currentIndex);

            playSong();

        }
    );


    /* =====================================================
       AUDIO ENDED
       ===================================================== */

    audio.addEventListener(
        "ended",
        () => {

            if (repeatMode === 1) {

                audio.currentTime = 0;

                playSong();

                return;
            }

            if (repeatMode === 2) {

                currentIndex++;

                if (
                    currentIndex >=
                    songs.length
                ) {
                    currentIndex = 0;
                }

                loadSong(currentIndex);

                playSong();

                return;
            }

            nextSong();
        }
    );


    /* =====================================================
       PROGRESS
       ===================================================== */

    audio.addEventListener(
        "loadedmetadata",
        () => {

            if (
                Number.isFinite(
                    audio.duration
                )
            ) {

                duration.textContent =
                    formatTime(
                        audio.duration
                    );

            }
        }
    );


    audio.addEventListener(
        "timeupdate",
        () => {

            if (!audio.duration) {
                return;
            }

            const percentage =
                (
                    audio.currentTime /
                    audio.duration
                ) * 100;

            progressBar.value =
                percentage;

            currentTime.textContent =
                formatTime(
                    audio.currentTime
                );

        }
    );


    progressBar.addEventListener(
        "input",
        () => {

            if (!audio.duration) {
                return;
            }

            audio.currentTime =
                (
                    progressBar.value /
                    100
                ) *
                audio.duration;

        }
    );


    /* =====================================================
       VOLUME
       ===================================================== */

    volumeBar.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    volumeBar.value
                );

            audio.volume = value;

            volumeValue.textContent =
                `${Math.round(value * 100)}%`;

            updateVolumeIcon(value);

        }
    );


    function updateVolumeIcon(value) {

        if (value === 0) {

            volumeIcon.textContent =
                "🔇";

        } else if (value < 0.5) {

            volumeIcon.textContent =
                "🔉";

        } else {

            volumeIcon.textContent =
                "🔊";
        }
    }


    /* =====================================================
       SHUFFLE
       ===================================================== */

    shuffleButton.addEventListener(
        "click",
        () => {

            isShuffle =
                !isShuffle;

            shuffleButton.classList.toggle(
                "active",
                isShuffle
            );

            showToast(
                isShuffle
                    ? "Shuffle enabled"
                    : "Shuffle disabled"
            );

        }
    );


    /* =====================================================
       REPEAT
       ===================================================== */

    repeatButton.addEventListener(
        "click",
        () => {

            repeatMode++;

            if (repeatMode > 2) {
                repeatMode = 0;
            }

            repeatButton.classList.toggle(
                "active",
                repeatMode !== 0
            );

            if (repeatMode === 0) {

                repeatButton.textContent =
                    "↻";

                showToast(
                    "Repeat off"
                );

            } else if (repeatMode === 1) {

                repeatButton.textContent =
                    "↻¹";

                showToast(
                    "Repeat current song"
                );

            } else {

                repeatButton.textContent =
                    "↻∞";

                showToast(
                    "Repeat playlist"
                );
            }

        }
    );


    /* =====================================================
       RENDER PLAYLIST
       ===================================================== */

    function renderPlaylist(
        filteredSongs = songs
    ) {

        playlist.innerHTML = "";

        if (filteredSongs.length === 0) {

            playlist.innerHTML = `
                <div class="no-results">
                    No music found.
                </div>
            `;

            return;
        }


        filteredSongs.forEach(
            (song) => {

                const realIndex =
                    songs.indexOf(song);

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "track";

                if (
                    realIndex ===
                    currentIndex
                ) {
                    card.classList.add(
                        "active"
                    );
                }


                card.innerHTML = `
                    <span class="track-number">
                        ${String(
                            realIndex + 1
                        ).padStart(2, "0")}
                    </span>

                    <img
                        class="track-cover"
                        src="${song.cover}"
                        alt="${song.title}"
                    >

                    <h4>
                        ${song.title}
                    </h4>

                    <p>
                        ${song.artist}
                    </p>

                    <div class="track-time">
                        ${song.mood}
                    </div>
                `;


                card.addEventListener(
                    "click",
                    () => {

                        loadSong(
                            realIndex
                        );

                        playSong();

                    }
                );


                playlist.appendChild(card);

            }
        );
    }


    /* =====================================================
       UPDATE ACTIVE CARD
       ===================================================== */

    function updatePlaylistActive() {

        document
            .querySelectorAll(".track")
            .forEach(
                (card) => {

                    card.classList.remove(
                        "active"
                    );
                }
            );

        renderPlaylist();
    }


    /* =====================================================
       SEARCH
       ===================================================== */

    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                renderPlaylist(
                    songs
                );

                return;
            }


            const filtered =
                songs.filter(
                    (song) => {

                        return (
                            song.title
                                .toLowerCase()
                                .includes(query) ||

                            song.artist
                                .toLowerCase()
                                .includes(query) ||

                            song.mood
                                .toLowerCase()
                                .includes(query)
                        );

                    }
                );


            renderPlaylist(
                filtered
            );

        }
    );


    /* =====================================================
       FAVORITE
       ===================================================== */

    favoriteButton.addEventListener(
        "click",
        () => {

            const existing =
                likedSongs.indexOf(
                    currentIndex
                );


            if (existing === -1) {

                likedSongs.push(
                    currentIndex
                );

                showToast(
                    "Added to favorites ♡"
                );

            } else {

                likedSongs.splice(
                    existing,
                    1
                );

                showToast(
                    "Removed from favorites"
                );
            }


            localStorage.setItem(
                "sonoraLikedSongs",
                JSON.stringify(
                    likedSongs
                )
            );


            updateFavoriteButton();

        }
    );


    function updateFavoriteButton() {

        if (
            likedSongs.includes(
                currentIndex
            )
        ) {

            favoriteButton.textContent =
                "♥";

            favoriteButton.style.color =
                "#ff7657";

        } else {

            favoriteButton.textContent =
                "♡";

            favoriteButton.style.color =
                "";

        }
    }


    /* =====================================================
       ATMOSPHERE BUTTON
       ===================================================== */

    themeButton.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "alternate"
            );

            showToast(
                "Atmosphere changed ✦"
            );

        }
    );


    /* =====================================================
       KEYBOARD SHORTCUTS
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.target.tagName ===
                "INPUT"
            ) {
                return;
            }


            if (
                event.code ===
                "Space"
            ) {

                event.preventDefault();

                if (isPlaying) {
                    pauseSong();
                } else {
                    playSong();
                }
            }


            if (
                event.code ===
                "ArrowRight"
            ) {

                audio.currentTime =
                    Math.min(
                        audio.currentTime + 5,
                        audio.duration || 0
                    );
            }


            if (
                event.code ===
                "ArrowLeft"
            ) {

                audio.currentTime =
                    Math.max(
                        audio.currentTime - 5,
                        0
                    );
            }

        }
    );


    /* =====================================================
       HELPERS
       ===================================================== */

    function formatTime(seconds) {

        if (
            !Number.isFinite(
                seconds
            )
        ) {
            return "0:00";
        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        const remainingSeconds =
            Math.floor(
                seconds % 60
            );

        return `${minutes}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }


    function showToast(message) {

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );

        clearTimeout(
            showToast.timeout
        );

        showToast.timeout =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2200
            );
    }

});