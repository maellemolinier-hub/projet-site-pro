/**
 * Validation humaine et publication des vidéos en attente.
 *
 * Commandes :
 *   node validate.js list                  — Affiche toutes les vidéos PRIVÉES en attente
 *   node validate.js publish <videoId>     — Publie une vidéo après validation
 *   node validate.js reject  <videoId>     — Supprime une vidéo rejetée
 *   node validate.js quota                 — Affiche l'état du quota API
 */

import { google } from 'googleapis';
import { getAuthenticatedClient } from './auth.js';
import { consumeQuota, showQuotaStatus } from './quota.js';

const COMMAND = process.argv[2];
const VIDEO_ID = process.argv[3];

// ─── Liste les vidéos privées (en attente de validation) ─────────────────────

async function listPending(youtube) {
  console.log('\n═══════════════════════════════════════════════');
  console.log('VIDÉOS EN ATTENTE DE VALIDATION');
  console.log('═══════════════════════════════════════════════\n');

  const response = await youtube.videos.list({
    part: ['snippet', 'status', 'statistics'],
    mine: true,
    maxResults: 50,
  });

  consumeQuota(['videos.list']);

  const private_videos = (response.data.items ?? []).filter(
    v => v.status?.privacyStatus === 'private'
  );

  if (private_videos.length === 0) {
    console.log('Aucune vidéo privée en attente.\n');
    return;
  }

  private_videos.forEach((video, idx) => {
    const s = video.snippet;
    console.log(`${idx + 1}. ${s.title}`);
    console.log(`   ID          : ${video.id}`);
    console.log(`   Publié le   : ${new Date(s.publishedAt).toLocaleDateString('fr-FR')}`);
    console.log(`   Description : ${s.description?.slice(0, 80)}...`);
    console.log(`   Studio      : https://studio.youtube.com/video/${video.id}/edit`);
    console.log(`   Publier     : node validate.js publish ${video.id}`);
    console.log(`   Rejeter     : node validate.js reject  ${video.id}\n`);
  });

  console.log(`Total : ${private_videos.length} vidéo(s) en attente\n`);
}

// ─── Publie une vidéo (PRIVATE → PUBLIC) ─────────────────────────────────────

async function publishVideo(youtube, videoId) {
  // Récupère les infos actuelles pour ne pas écraser snippet
  const current = await youtube.videos.list({
    part: ['snippet', 'status'],
    id: [videoId],
  });

  if (!current.data.items?.length) {
    throw new Error(`Vidéo introuvable : ${videoId}`);
  }

  const video = current.data.items[0];
  if (video.status.privacyStatus === 'public') {
    console.log(`La vidéo ${videoId} est déjà publique.`);
    return;
  }

  console.log(`\nPublication de : "${video.snippet.title}"`);
  console.log('Êtes-vous sûr(e) ? Cette action rend la vidéo visible publiquement.');
  console.log('(Tapez Ctrl+C pour annuler, ou attendez 5 secondes)\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  await youtube.videos.update({
    part: ['status'],
    requestBody: {
      id: videoId,
      status: {
        privacyStatus: 'public',
        publishAt: null,
      },
    },
  });

  consumeQuota(['videos.list', 'videos.update']);

  console.log('═══════════════════════════════════════════════');
  console.log('VIDÉO PUBLIÉE AVEC SUCCÈS');
  console.log('═══════════════════════════════════════════════');
  console.log(`Titre       : ${video.snippet.title}`);
  console.log(`URL YouTube : https://www.youtube.com/watch?v=${videoId}`);
  console.log(`Statut      : PUBLIC\n`);
}

// ─── Supprime une vidéo rejetée ───────────────────────────────────────────────

async function rejectVideo(youtube, videoId) {
  const current = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId],
  });

  if (!current.data.items?.length) {
    throw new Error(`Vidéo introuvable : ${videoId}`);
  }

  const title = current.data.items[0].snippet.title;
  console.log(`\nSuppression de : "${title}" (${videoId})`);
  console.log('ATTENTION : Cette action est irréversible !');
  console.log('(Tapez Ctrl+C pour annuler, ou attendez 10 secondes)\n');

  await new Promise(resolve => setTimeout(resolve, 10000));

  await youtube.videos.delete({ id: videoId });

  consumeQuota(['videos.list']);

  console.log(`Vidéo "${title}" supprimée.\n`);
}

// ─── Point d'entrée ──────────────────────────────────────────────────────────

async function main() {
  if (COMMAND === 'quota') {
    showQuotaStatus();
    return;
  }

  const auth = await getAuthenticatedClient();
  const youtube = google.youtube({ version: 'v3', auth });

  switch (COMMAND) {
    case 'list':
      await listPending(youtube);
      break;

    case 'publish':
      if (!VIDEO_ID) throw new Error('Précisez un ID vidéo : node validate.js publish <videoId>');
      await publishVideo(youtube, VIDEO_ID);
      break;

    case 'reject':
      if (!VIDEO_ID) throw new Error('Précisez un ID vidéo : node validate.js reject <videoId>');
      await rejectVideo(youtube, VIDEO_ID);
      break;

    default:
      console.log('Usage :');
      console.log('  node validate.js list                   — Vidéos en attente');
      console.log('  node validate.js publish <videoId>      — Publier');
      console.log('  node validate.js reject  <videoId>      — Supprimer');
      console.log('  node validate.js quota                  — État du quota API\n');
  }
}

main().catch((err) => {
  console.error('\nErreur :', err.message);
  process.exit(1);
});
