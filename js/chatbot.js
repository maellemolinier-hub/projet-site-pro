/* ===== MAËLLE JEAN — Chatbot IA ===== */

const chatKnowledge = {
  "estimer|estimation|prix|valeur|combien vaut": {
    response: "Bien sûr ! Je peux vous orienter. Pour une estimation précise basée sur les données DVF et mon expertise du marché local, je vous invite à utiliser notre <a href='pages/estimation.html' style='color:var(--color-accent);font-weight:600;'>module d'estimation gratuit →</a>. Vous recevrez un pré-dossier complet avec les vrais prix de vente dans votre quartier.",
    suggestions: ["Comment fonctionne l'estimation ?", "Je veux un rendez-vous", "C'est quoi DVF ?"]
  },
  "dvf|données|base": {
    response: "DVF signifie <strong>Demandes de Valeurs Foncières</strong> — c'est la base officielle du gouvernement qui recense <strong>toutes les ventes immobilières réelles</strong> en France. Contrairement aux prix affichés, ce sont les prix réellement payés. J'utilise cette donnée pour vous donner une estimation qui tient la route face aux banques et acheteurs.",
    suggestions: ["Estimer mon bien", "Prendre RDV", "Comment vendre vite ?"]
  },
  "home staging|décoration|aménagement|mettre en valeur": {
    response: "Le home staging, c'est ma passion ! 🏠 Concrètement : je vous conseille sur la dépersonnalisation, le désencombrement, les petites retouches qui font décrocher la mâchoire des acheteurs. Pas besoin de gros travaux — <strong>90% se fait avec ce que vous avez déjà</strong>. Résultat : bien vendu en moyenne 30% plus vite.",
    suggestions: ["Réserver un audit home staging", "Voir les résultats", "Prendre RDV"]
  },
  "rdv|rendez-vous|rencontrer|consultation|appel": {
    response: "Super ! Je propose des créneaux du lundi au samedi. Vous pouvez <a href='pages/rendez-vous.html' style='color:var(--color-accent);font-weight:600;'>réserver directement en ligne →</a>. La première consultation est <strong>offerte et sans engagement</strong>. On fait le point sur votre projet et je vous dis franchement ce que je pense.",
    suggestions: ["Je veux estimer mon bien", "Quelles sont vos zones ?", "Comment se déroule la vente ?"]
  },
  "zone|secteur|cannes|grasse|antibes|mougins|côte d'azur|06": {
    response: "J'interviens principalement sur <strong>Cannes, Grasse, Mougins, Le Cannet, Antibes, Valbonne et Mandelieu</strong>. Je connais ces marchés depuis 2018 — leurs micro-secteurs, leurs spécificités, leurs acheteurs cibles. Cette connaissance terrain fait toute la différence pour fixer le bon prix.",
    suggestions: ["Estimer mon bien à Cannes", "RDV sur Grasse", "Comment vendez-vous ?"]
  },
  "vendre|vente|comment|process|fonctionnement|étapes": {
    response: "Voici comment je travaille avec vous :\n1. 📋 <strong>Audit gratuit</strong> — on visite ensemble, j'analyse le marché\n2. 💰 <strong>Estimation DVF</strong> — je vous donne un prix réaliste et justifié\n3. 🏠 <strong>Home staging</strong> — mise en valeur professionnelle\n4. 📸 <strong>Photos & visite virtuelle 3D</strong>\n5. 📣 <strong>Diffusion multi-portails</strong>\n6. 🤝 <strong>Accompagnement jusqu'à la signature</strong>",
    suggestions: ["Prendre RDV", "Combien ça coûte ?", "Délai pour vendre ?"]
  },
  "tarif|frais|commission|coût|prix service": {
    response: "Je vous en parle en toute transparence lors de la consultation offerte. Mes honoraires sont dans la norme du marché azuréen, <strong>mais ma vraie valeur ajoutée c'est le résultat</strong> : bien vendu au bon prix, rapidement. Beaucoup de clients me disent avoir récupéré mes honoraires grâce au meilleur prix obtenu.",
    suggestions: ["Prendre RDV", "Estimer mon bien", "En savoir plus sur le home staging"]
  },
  "ebook|guide|conseils|télécharger": {
    response: "Mon e-book <strong>\"5 Conseils Pour Bien Vendre\"</strong> est 100% gratuit. Il couvre : fixer le bon prix, le home staging accessible, les diagnostics, la négociation et les pièges juridiques. <a href='pages/ebook.html' style='color:var(--color-accent);font-weight:600;'>Télécharger l'e-book →</a>",
    suggestions: ["Prendre RDV", "Estimer mon bien"]
  },
  "délai|rapide|vite|temps": {
    response: "Avec ma méthode, les biens bien présentés et correctement estimés se vendent en moyenne en <strong>30 à 60 jours</strong> sur la Côte d'Azur. Le home staging réduit le délai de 30%, et l'estimation juste évite les négociations interminables.",
    suggestions: ["Comment vous travaillez ?", "Prendre RDV", "Home staging"]
  },
  "formatrice|formation|professionnel": {
    response: "Oui ! En plus de mon activité de conseil, je forme des professionnels de l'immobilier — agents, conseillers, négociateurs — sur l'estimation, la valeur vénale et les nouvelles techniques de vente. Si vous êtes professionnel, contactez-moi directement pour les programmes de formation.",
    suggestions: ["Me contacter", "Prendre RDV"]
  },
  "bonjour|salut|hello|bonsoir": {
    response: "Bonjour ! 😊 Ravi de vous accueillir. Je suis l'assistante IA de Maëlle Jean, experte immobilière sur la Côte d'Azur depuis 2018. Comment puis-je vous aider aujourd'hui ?",
    suggestions: ["Estimer mon bien", "Comment vendre vite ?", "Prendre RDV"]
  }
};

const defaultResponse = {
  response: "Je n'ai pas tout saisi, désolée ! 😊 Pour une réponse personnalisée, vous pouvez <a href='pages/rendez-vous.html' style='color:var(--color-accent);font-weight:600;'>prendre un RDV gratuit avec Maëlle →</a> ou utiliser nos outils en ligne.",
  suggestions: ["Estimer mon bien", "Prendre RDV", "Voir les services"]
};

function findAnswer(text) {
  const lower = text.toLowerCase();
  for (const [pattern, data] of Object.entries(chatKnowledge)) {
    const keywords = pattern.split('|');
    if (keywords.some(k => lower.includes(k))) return data;
  }
  return defaultResponse;
}

function addMessage(content, isUser = false) {
  const msgs = document.getElementById('chatbotMessages');
  if (!msgs) return;
  const suggestions = document.getElementById('chatSuggestions');
  if (suggestions) suggestions.remove();
  const msg = document.createElement('div');
  msg.className = `chat-msg${isUser ? ' chat-msg--user' : ''}`;
  msg.innerHTML = `
    <div class="chat-avatar">${isUser ? 'V' : 'MJ'}</div>
    <div class="chat-bubble">${content}</div>
  `;
  msgs.appendChild(msg);
  msgs.scrollTop = msgs.scrollHeight;
}

function addSuggestions(items) {
  const msgs = document.getElementById('chatbotMessages');
  if (!msgs || !items?.length) return;
  const div = document.createElement('div');
  div.className = 'chat-suggestions';
  div.id = 'chatSuggestions';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = item;
    btn.onclick = () => sendSuggestion(item);
    div.appendChild(btn);
  });
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chatbotMessages');
  if (!msgs) return;
  const typing = document.createElement('div');
  typing.className = 'chat-msg';
  typing.id = 'typingIndicator';
  typing.innerHTML = `<div class="chat-avatar">MJ</div><div class="typing-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function sendSuggestion(text) {
  addMessage(text, true);
  const panel = document.getElementById('chatbotPanel');
  if (panel) panel.classList.add('open');
  showTyping();
  setTimeout(() => {
    removeTyping();
    const answer = findAnswer(text);
    addMessage(answer.response);
    addSuggestions(answer.suggestions);
  }, 900 + Math.random() * 600);
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  addMessage(text, true);
  showTyping();
  setTimeout(() => {
    removeTyping();
    const answer = findAnswer(text);
    addMessage(answer.response);
    addSuggestions(answer.suggestions);
  }, 800 + Math.random() * 700);
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendMessage();
}

// Show chatbot hint after 6s
setTimeout(() => {
  const hint = document.getElementById('chatbotHint');
  if (hint) hint.style.display = 'block';
}, 6000);
