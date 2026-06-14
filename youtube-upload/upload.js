/**
 * Upload d'une vidéo YouTube en mode PRIVÉ pour validation humaine.
 *
 * Usage :
 *   node upload.js --video ./ma-video.mp4 --thumbnail ./miniature.jpg \
 *                  --title "Mon titre" --description "Ma description" \
 *                  [--tags "tag1,tag2"] [--category 22] [--playlist PLAYLIST_ID]
 *
 * La vidéo est uploadée en statut PRIVATE.
 * Utilisez `node validate.js publish <videoId>` pour la rendre publique.
 */

import { createReadStream, statSync } from 'fs';
import { google } from 'googleapis';
import { getAuthenticatedClient } from './auth.js';
import { checkQuota, consumeQuota, showQuotaStatus } from './quota.js';

// ─── Parsing des arguments CLI ──────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

function requireArg(args, key) {
  if (!args[key]) throw new Error(`Argument manquant : --${key}`);
  return args[key];
}

// ─── Upload vidéo ───────────────────────────────────────────────────────────

async function uploadVideo(youtube, { videoPath, title, description, tags, categoryId }) {
  const fileSize = statSync(videoPath).size;
  console.log(`Fichier vidéo : ${videoPath} (${(fileSize / 1024 / 1024).toFixed(1)} Mo)`);

  const resource = {
    snippet: {
      title,
      description,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      categoryId: categoryId ?? '22',       // 22 = People & Blogs (immobilier)
      defaultLanguage: 'fr',
      defaultAudioLanguage: 'fr',
    },
    status: {
      privacyStatus: 'private',             // TOUJOURS privé à l'upload
      selfDeclaredMadeForKids: false,
    },
  };

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: resource,
    media: {
      body: createReadStream(videoPath),
    },
  }, {
    onUploadProgress: (evt) => {
      const pct = Math.round((evt.bytesRead / fileSize) * 100);
      process.stdout.write(`\rProgression upload : ${pct}%`);
    },
  });

  console.log('\n');
  return response.data;
}

// ─── Upload miniature ────────────────────────────────────────────────────────

async function uploadThumbnail(youtube, videoId, thumbnailPath) {
  console.log(`Upload miniature : ${thumbnailPath}`);
  const ext = thumbnailPath.split('.').pop().toLowerCase();
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
  const mimeType = mimeMap[ext] ?? 'image/jpeg';

  await youtube.thumbnails.set({
    videoId,
    media: {
      mimeType,
      body: createReadStream(thumbnailPath),
    },
  });
  console.log('Miniature uploadée avec succès.');
}

// ─── Ajout à une playlist ────────────────────────────────────────────────────

async function addToPlaylist(youtube, videoId, playlistId) {
  await youtube.playlistItems.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: { kind: 'youtube#video', videoId },
      },
    },
  });
  console.log(`Vidéo ajoutée à la playlist ${playlistId}.`);
}

// ─── Point d'entrée ──────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const videoPath     = requireArg(args, 'video');
  const thumbnailPath = requireArg(args, 'thumbnail');
  const title         = requireArg(args, 'title');
  const description   = requireArg(args, 'description');
  const tags          = args.tags ?? '';
  const categoryId    = args.category ?? '22';
  const playlistId    = args.playlist ?? null;

  // Vérification du quota avant de commencer
  const ops = ['videos.insert', 'thumbnails.set'];
  if (playlistId) ops.push('playlistItems.insert');
  checkQuota(ops);
  showQuotaStatus();

  console.log(`Titre       : ${title}`);
  console.log(`Statut      : PRIVÉ (validation requise avant publication)\n`);

  const auth = await getAuthenticatedClient();
  const youtube = google.youtube({ version: 'v3', auth });

  // 1. Upload de la vidéo
  const videoData = await uploadVideo(youtube, { videoPath, title, description, tags, categoryId });
  const videoId = videoData.id;
  console.log(`Vidéo uploadée — ID : ${videoId}`);
  console.log(`URL YouTube Studio : https://studio.youtube.com/video/${videoId}/edit`);

  // 2. Upload de la miniature
  await uploadThumbnail(youtube, videoId, thumbnailPath);

  // 3. Ajout à la playlist si précisé
  if (playlistId) await addToPlaylist(youtube, videoId, playlistId);

  // 4. Enregistrement du quota consommé
  consumeQuota(ops);

  // 5. Résumé pour validation humaine
  console.log('\n═══════════════════════════════════════════════');
  console.log('VALIDATION REQUISE AVANT PUBLICATION');
  console.log('═══════════════════════════════════════════════');
  console.log(`ID vidéo    : ${videoId}`);
  console.log(`Titre       : ${title}`);
  console.log(`Statut      : PRIVÉ`);
  console.log(`Vérifier    : https://studio.youtube.com/video/${videoId}/edit`);
  console.log('\nCommande de publication après validation :');
  console.log(`  node validate.js publish ${videoId}`);
  console.log('═══════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('\nErreur :', err.message);
  process.exit(1);
});
