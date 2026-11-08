# Non-Stop-Pop FM – page radio en direct

Page statique (HTML/CSS/JS, rien à installer) prête pour GitHub Pages.
Elle lit une vidéo YouTube avec le lecteur officiel intégré, en boucle, et synchronise tout le monde sur la même position.

## Contenu

- `index.html`, `style.css`, `script.js` : la page
- `config.js` : ID YouTube, synchro on/off
- `assets/logo.png` et `assets/girl.png` : **tes deux images** (à déposer)

## Synchro « en direct pour tout le monde »

Si `SYNC` vaut `true` et que la vidéo est un fichier classique, la position est calculée à partir de l'heure (`heure % durée`). Tout le monde entend donc le même moment au même instant, et la vidéo repart à la fin. Une resynchronisation a lieu toutes les 15 secondes si l'écart dépasse `MAX_DRIFT`.
Si c'est un vrai live YouTube, c'est naturellement synchronisé.
L'heure utilisée est celle de chaque appareil : un appareil mal réglé aura quelques secondes de décalage.

## Publier sur GitHub Pages

1. Envoie tous les fichiers à la racine d'un dépôt GitHub (avec le dossier `assets`).
2. `Settings` → `Pages` → `Deploy from a branch` → `main` → `/ (root)`.
3. Le site est en ligne sur `https://<ton-user>.github.io/<ton-depot>/`.

## Test en local

```bash
python3 -m http.server 8000
```
puis ouvre http://localhost:8000 (le lecteur YouTube ne fonctionne pas depuis un fichier ouvert en `file://`).

## Mentions

Projet de fan non officiel, sans lien avec Rockstar Games. Ce dépôt ne contient ni musique ni visuels officiels.
