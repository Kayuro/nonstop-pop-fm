(() => {
  const CFG = window.RADIO_CONFIG || {};
  const YT_ID = (CFG.YOUTUBE_ID || "").trim();
  const SYNC = CFG.SYNC !== false;
  const MAX_DRIFT = Number(CFG.MAX_DRIFT) || 3;

  const playBtn = document.getElementById("playBtn");
  const statusEl = document.getElementById("status");
  const volume = document.getElementById("volume");
  const videoWrap = document.getElementById("videoWrap");
  const nowTitle = document.getElementById("nowTitle");
  const nowArtist = document.getElementById("nowArtist");

  // ---------- Images optionnelles : masquées si absentes ----------
  document.querySelectorAll("img[data-optional]").forEach((img) => {
    img.addEventListener("error", () => { img.hidden = true; });
    if (img.complete && img.naturalWidth === 0) img.hidden = true;
  });

  // ---------- Interface ----------
  function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("error", isError);
  }
  function setPlaying(on) {
    playBtn.classList.toggle("on", on);
    playBtn.setAttribute("aria-label", on ? "Pause" : "Lecture");
  }

  // ---------- Liste des titres ----------
  function parseTracklist(text) {
    const out = [];
    String(text || "").split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*[-–—.)]?\s*(.+?)\s*$/);
      if (!m) return;
      const start = (Number(m[1]) || 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
      const label = m[4];
      const i = label.indexOf(" - ");
      out.push({
        start,
        artist: i > -1 ? label.slice(0, i).trim() : "",
        title: i > -1 ? label.slice(i + 3).trim() : label
      });
    });
    return out.sort((a, b) => a.start - b.start);
  }
  const TRACKS = parseTracklist(CFG.TRACKLIST);

  function updateNowPlaying() {
    if (!player || !player.getCurrentTime) return;
    if (TRACKS.length) {
      const t = player.getCurrentTime();
      let cur = TRACKS[0];
      for (const tr of TRACKS) { if (tr.start <= t) cur = tr; else break; }
      nowTitle.textContent = cur.title;
      nowArtist.textContent = cur.artist;
    } else {
      const data = player.getVideoData ? player.getVideoData() : null;
      nowTitle.textContent = (data && data.title) || "Non-Stop-Pop FM";
      nowArtist.textContent = (data && data.author) || "";
    }
  }

  // ---------- Lecteur YouTube (lecteur officiel intégré) ----------
  let player = null;
  let ready = null;
  let needSync = true;
  let driftTimer = null;
  let nowTimer = null;

  function isFiniteVideo() {
    const d = player.getDuration();
    return d && d > 30; // 0 ou très court = live / inconnu
  }

  function syncNow(force) {
    if (!SYNC || !player || !isFiniteVideo()) return;
    const d = player.getDuration();
    const expected = (Date.now() / 1000) % d;
    const cur = player.getCurrentTime();
    let diff = Math.abs(cur - expected);
    diff = Math.min(diff, d - diff);
    if (force || diff > MAX_DRIFT) player.seekTo(expected, true);
  }

  function stopTimers() {
    clearInterval(driftTimer);
    clearInterval(nowTimer);
  }

  function onState(e) {
    const S = window.YT.PlayerState;
    if (e.data === S.PLAYING) {
      setPlaying(true);
      setStatus("");
      if (needSync) { needSync = false; syncNow(true); }
      updateNowPlaying();
      stopTimers();
      driftTimer = setInterval(() => syncNow(false), 15000);
      nowTimer = setInterval(updateNowPlaying, 1000);
    } else if (e.data === S.BUFFERING) {
      setStatus("Chargement…");
    } else if (e.data === S.PAUSED) {
      setPlaying(false);
      setStatus("");
      needSync = true;
      stopTimers();
    } else if (e.data === S.ENDED) {
      needSync = false;
      if (isFiniteVideo() && SYNC) syncNow(true); else player.seekTo(0, true);
      player.playVideo();
    }
  }

  function loadPlayer() {
    if (ready) return ready;
    ready = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => reject(new Error("API YouTube indisponible"));
      window.onYouTubeIframeAPIReady = () => {
        player = new window.YT.Player("ytPlayer", {
          videoId: YT_ID,
          width: "100%",
          height: "100%",
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => { player.setVolume(Number(volume.value)); resolve(); },
            onStateChange: onState,
            onError: () => {
              setStatus("Vidéo indisponible ou intégration bloquée par son auteur.", true);
              setPlaying(false);
            }
          }
        });
      };
      document.head.appendChild(s);
    });
    ready.catch(() => { ready = null; });
    return ready;
  }

  async function toggle() {
    if (!YT_ID) { setStatus("Aucun YOUTUBE_ID dans config.js.", true); return; }
    videoWrap.hidden = false;
    try {
      setStatus("Chargement…");
      await loadPlayer();
      if (player.getPlayerState() === window.YT.PlayerState.PLAYING) player.pauseVideo();
      else player.playVideo();
    } catch {
      setStatus("Impossible de charger YouTube.", true);
    }
  }

  playBtn.addEventListener("click", toggle);
  volume.addEventListener("input", () => {
    if (player && player.setVolume) player.setVolume(Number(volume.value));
  });
})();
