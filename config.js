// ============================================================
//  CONFIGURATION
// ============================================================
window.RADIO_CONFIG = {
  // ID de la vidéo YouTube (la partie après ?v= dans l'URL)
  YOUTUBE_ID: "Ej1nxBxFSKc",

  // true  : tout le monde entend le même moment de la vidéo au même instant
  // false : chacun démarre au début
  SYNC: true,

  // Écart toléré (en secondes) avant de resynchroniser automatiquement
  MAX_DRIFT: 3,

  // Liste des titres pour afficher « titre + artiste » pendant la lecture.
  // Une ligne par morceau : heure de début, puis « Artiste - Titre ».
  // Exemple de format (à remplacer par ta vraie liste) :
  //   0:00 Artiste - Titre
  //   3:42 Autre artiste - Autre titre
  //   1:05:10 Artiste - Titre après une heure
  // Si c'est vide, la page affiche le titre de la vidéo YouTube.
  TRACKLIST: `

`
};
