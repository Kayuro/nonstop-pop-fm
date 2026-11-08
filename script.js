(() => {
  const CFG = window.RADIO_CONFIG || {};
  const YT_ID = (CFG.YOUTUBE_ID || "").trim();
  const SYNC = CFG.SYNC !== false;
  const MAX_DRIFT = Number(CFG.MAX_DRIFT) || 3;

  const playBtn = document.getElementById("playBtn");
  const iconPlay = document.getElementById("iconPlay");
  const iconPause = document.getElementById("iconPause");
  const playLabel = document.getElementById("playLabel");
  const statusEl = document.getElementById("status");
  const volume = document.getElementById("volume");
  const videoWrap = document.getElementById("videoWrap");

  // ---------- Emplacements d'images (logo / personnage) ----------
  function watchSlot(imgId, slotId) {
    const img = document.getElementById(imgId);
    const slot = document.getElementById(slotId);
    const check = () => slot.classList.toggle("missing", !(img.complete && img.naturalWidth > 0));
    img.addEventListener("error", () => slot.classList.add("missing"));
    img.addEventListener("load", () => slot.classList.remove("missing"));
    check();
  }
  watchSlot("logo", "logoSlot");
  watchSlot("girl", "girlSlot");

  // ---------- Etat de l'interface ----------
  function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("error", isError);
  }
  function setPlaying(on) {
    iconPlay.hidden = on;
    iconPause.hidden = !on;
    playLabel.textContent = on ? "Pause" : "Écouter";
  }

  // ---------- Lecteur YouTube ----------
  let player = null;
  let ready = null;
  let needSync = true;
  let driftTimer = null;

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
    diff = Math.min(diff, d - diff); // gère le passage de fin de boucle
    if (force || diff > MAX_DRIFT) player.seekTo(expected, true);
  }

  function onState(e) {
    const S = window.YT.PlayerState;
    if (e.data === S.PLAYING) {
      setPlaying(true);
      setStatus(isFiniteVideo() && SYNC ? "🔴 En direct, synchronisé" : "🔴 En direct");
      if (needSync) { needSync = false; syncNow(true); }
      clearInterval(driftTimer);
      driftTimer = setInterval(() => syncNow(false), 15000);
    } else if (e.data === S.BUFFERING) {
      setStatus("Mise en mémoire tampon…");
    } else if (e.data === S.PAUSED) {
      setPlaying(false);
      setStatus("En pause");
      needSync = true;
      clearInterval(driftTimer);
    } else if (e.data === S.ENDED) {
      // Boucle : on repart à la bonne position du direct
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
      setStatus("Connexion…");
      await loadPlayer();
      if (player.getPlayerState() === window.YT.PlayerState.PLAYING) player.pauseVideo();
      else player.playVideo();
    } catch {
      setStatus("Impossible de charger YouTube.", true);
    }
  }

  playBtn.addEventListener("click", toggle);
  volume.addEventListener("input", () => { if (player && player.setVolume) player.setVolume(Number(volume.value)); });
})();
