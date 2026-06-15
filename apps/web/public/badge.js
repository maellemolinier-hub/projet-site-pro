/**
 * ImmoExpert Badge — Widget embarquable
 * Usage: <script src="https://immoexpert.fr/badge.js" data-token="TOKEN" data-type="expert|map|prix"></script>
 */
(function () {
  "use strict";

  var BASE_URL = "https://immoexpert.fr";

  function init() {
    var scripts = document.querySelectorAll('script[data-token]');
    scripts.forEach(function (script) {
      var token = script.getAttribute("data-token");
      var type = script.getAttribute("data-type") || "expert";
      var theme = script.getAttribute("data-theme") || "light";
      var lang = script.getAttribute("data-lang") || "fr";
      if (!token) return;
      renderWidget(script, token, type, theme, lang);
    });
  }

  function renderWidget(script, token, type, theme, lang) {
    var container = document.createElement("div");
    container.className = "immoexpert-widget";
    container.style.cssText = "display:inline-block;max-width:100%;";

    if (type === "expert") {
      renderExpertBadge(container, token, theme, lang);
    } else if (type === "map") {
      renderMapWidget(container, token, theme);
    } else if (type === "prix") {
      renderPriceWidget(container, token, theme);
    }

    script.parentNode.insertBefore(container, script);
  }

  function renderExpertBadge(container, token, theme, lang) {
    var isDark = theme === "dark";
    var bg = isDark ? "#1a3a6b" : "#ffffff";
    var text = isDark ? "#ffffff" : "#111827";
    var sub = isDark ? "rgba(255,255,255,0.6)" : "#6B7280";
    var border = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB";

    container.innerHTML = [
      '<div style="',
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;",
        "background:" + bg + ";",
        "border:1px solid " + border + ";",
        "border-radius:16px;",
        "padding:16px 20px;",
        "display:inline-flex;",
        "align-items:center;",
        "gap:12px;",
        "box-shadow:0 2px 12px rgba(0,0,0,0.08);",
        "text-decoration:none;",
        "max-width:320px;",
      '">',
        '<div style="width:48px;height:48px;border-radius:12px;background:' + (isDark ? "rgba(255,255,255,0.15)" : "#EFF6FF") + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">',
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="' + (isDark ? "#60A5FA" : "#1D4ED8") + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
          '</svg>',
        '</div>',
        '<div>',
          '<div style="font-weight:700;font-size:14px;color:' + text + ';line-height:1.2;">Expert Certifié</div>',
          '<div style="font-size:12px;color:' + sub + ';margin-top:2px;">ImmoExpert · Valeur Vénale</div>',
          '<a href="' + BASE_URL + '/api/widget/' + encodeURIComponent(token) + '/verify" ',
            'target="_blank" rel="noopener" ',
            'style="font-size:11px;color:' + (isDark ? "#60A5FA" : "#1D4ED8") + ';text-decoration:none;margin-top:4px;display:block;">',
            '✓ Vérifier la certification →',
          '</a>',
        '</div>',
      '</div>'
    ].join("");
  }

  function renderMapWidget(container, token, theme) {
    var height = "400px";
    var iframe = document.createElement("iframe");
    iframe.src = BASE_URL + "/widget/carte?token=" + encodeURIComponent(token) + "&theme=" + theme;
    iframe.style.cssText = "width:100%;height:" + height + ";border:0;border-radius:16px;";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("title", "ImmoExpert — Carte des prix immobiliers");
    container.appendChild(iframe);
  }

  function renderPriceWidget(container, token, theme) {
    var iframe = document.createElement("iframe");
    iframe.src = BASE_URL + "/widget/prix?token=" + encodeURIComponent(token) + "&theme=" + theme;
    iframe.style.cssText = "width:100%;height:200px;border:0;border-radius:16px;";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", "ImmoExpert — Prix du marché");
    container.appendChild(iframe);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
