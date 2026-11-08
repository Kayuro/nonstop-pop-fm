// ============================================================
//  CONFIGURATION
// ============================================================
window.RADIO_CONFIG = {
  // ID de la vidéo YouTube (la partie après ?v= dans l'URL)
  YOUTUBE_ID: "Ej1nxBxFSKc",

  // true  : tout le monde entend le même moment de la vidéo au même instant
  //         (position calculée à partir de l'heure, en boucle).
  // false : chacun démarre au début.
  // Si la vidéo est un vrai live YouTube, c'est déjà synchronisé : rien à faire.
  SYNC: true,

  // Écart toléré (en secondes) avant de resynchroniser automatiquement
  MAX_DRIFT: 3
};
