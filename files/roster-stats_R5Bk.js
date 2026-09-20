(function () {
  var DATA_URL = "files/a_data/players.json";
  var API_BASE = "https://api.brawlhalla.com/v1";

  var ROSTER = [];
  var loadFailed = false;

  var SIGNED_IDS = [11075924, 60698133, 52610289, 68370688, 9921820];

  var ICON_BASE = "files/assets/legends/";
  var LEGENDS = {
    3: { name: "Bödvar", slug: "bodvar" }, 4: { name: "Cassidy", slug: "cassidy" },
    5: { name: "Orion", slug: "orion" }, 6: { name: "Lord Vraxx", slug: "lord vraxx" },
    7: { name: "Gnash", slug: "gnash" }, 8: { name: "Queen Nai", slug: "queen nai" },
    9: { name: "Lucien", slug: "lucien" }, 10: { name: "Hattori", slug: "hattori" },
    11: { name: "Sir Roland", slug: "sir roland" }, 12: { name: "Scarlet", slug: "scarlet" },
    13: { name: "Thatch", slug: "thatch" }, 14: { name: "Ada", slug: "ada" },
    15: { name: "Sentinel", slug: "sentinel" }, 16: { name: "Teros", slug: "teros" },
    17: { name: "Red Raptor", slug: "redraptor" }, 18: { name: "Ember", slug: "ember" },
    19: { name: "Brynn", slug: "brynn" }, 20: { name: "Asuri", slug: "asuri" },
    21: { name: "Barraza", slug: "barraza" }, 22: { name: "Ulgrim", slug: "ulgrim" },
    23: { name: "Azoth", slug: "azoth" }, 24: { name: "Koji", slug: "koji" },
    25: { name: "Diana", slug: "diana" }, 26: { name: "Jhala", slug: "jhala" },
    27: { name: "Loki", slug: "loki" }, 28: { name: "Kor", slug: "kor" },
    29: { name: "Wu Shang", slug: "wu shang" }, 30: { name: "Val", slug: "val" },
    31: { name: "Ragnir", slug: "ragnir" }, 32: { name: "Cross", slug: "cross" },
    33: { name: "Mirage", slug: "mirage" }, 34: { name: "Nix", slug: "nix" },
    35: { name: "Mordex", slug: "mordex" }, 36: { name: "Yumiko", slug: "yukimo" },
    37: { name: "Artemis", slug: "artemis" }, 38: { name: "Caspian", slug: "caspian" },
    39: { name: "Sidra", slug: "sidra" }, 40: { name: "Xull", slug: "xull" },
    41: { name: "Isaiah", slug: "isaiah" }, 42: { name: "Kaya", slug: "kaya" },
    43: { name: "Jiro", slug: "jiro" }, 44: { name: "Lin Fei", slug: "lin fei" },
    45: { name: "Zariel", slug: "zariel" }, 46: { name: "Rayman", slug: "rayman" },
    47: { name: "Dusk", slug: "dusk" }, 48: { name: "Fait", slug: "fait" },
    49: { name: "Thor", slug: "thor" }, 50: { name: "Petra", slug: "petra" },
    51: { name: "Vector", slug: "vector" }, 52: { name: "Volkov", slug: "volkov" },
    53: { name: "Onyx", slug: "onyx" }, 54: { name: "Jaeyun", slug: "jaeyun" },
    55: { name: "Mako", slug: "mako" }, 56: { name: "Magyar", slug: "magyar" },
    57: { name: "Reno", slug: "reno" }, 58: { name: "Munin", slug: "munin" },
    59: { name: "Arcadia", slug: "arcadia" }, 60: { name: "Ezio", slug: "ezio" },
    61: { name: "Seven", slug: "seven" }, 62: { name: "Thea", slug: "thea" },
    63: { name: "Tezca", slug: "tezca" }, 64: { name: "Vivi", slug: "vivi" },
    65: { name: "Imugi", slug: "imugi" }, 66: { name: "King Zuva", slug: "king zuva" },
    67: { name: "Priya", slug: "priya" }, 68: { name: "Ransom", slug: "ransom" },
    69: { name: "Lady Vera", slug: "lady vera" }, 70: { name: "Rupture", slug: "rupture" },
    71: { name: "Aurus", slug: "aurus" }, 72: { name: "Qinghua & Baobao", slug: "qinghua-baobao" }
  };
  function legendName(id) {
    return LEGENDS[id] ? LEGENDS[id].name : ("Legend #" + id);
  }
  function legendIcon(id) {
    var l = LEGENDS[id];
    return l ? ICON_BASE + encodeURIComponent(l.slug) + ".webp" : "";
  }

  function initials(name) {
    var clean = name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    var parts = clean.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function winrate(p) { return p.games ? p.wins / p.games : 0; }

  function toRosterEntry(p) {
    var rawLegends = p.legends || p.legends_all || [];
    var legends = rawLegends.map(function (l) {
      var legendId = (l.legend_id !== undefined ? l.legend_id : l.id);
      var out = {};
      for (var k in l) out[k] = l[k];          // conserva daño, KOs, tiempos, xp, nivel...
      out.id = legendId; out.name = legendName(legendId); out.games = l.games; out.wins = l.wins;
      return out;
    })
      .filter(function (l) { return l.games > 0; })
      .sort(function (a, b) { return b.games - a.games; });
    return {
      name: p.name,
      brawlhalla_id: p.brawlhalla_id,
      region: p.region || null,
      tier: p.tier || null,
      rating: (p.rating === undefined ? null : p.rating),
      peak_rating: (p.peak_rating === undefined ? null : p.peak_rating),
      global_rank: (p.global_rank === undefined ? null : p.global_rank),
      games: (p.games !== undefined ? p.games : (p.games_all || 0)),
      wins: (p.wins !== undefined ? p.wins : (p.wins_all || 0)),
      level: (p.level === undefined ? null : p.level),
      xp: (p.xp === undefined ? null : p.xp),
      games_ranked: (p.games_ranked === undefined ? null : p.games_ranked),
      wins_ranked: (p.wins_ranked === undefined ? null : p.wins_ranked),
      legends: legends
    };
  }

  // ---------- stats extendidas (daño, KOs, tiempos, xp) ----------
  function fmtNum(n) { return (n === undefined || n === null) ? "—" : Number(n).toLocaleString("en"); }
  function fmtTime(sec) {
    if (sec === undefined || sec === null) return "—";
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return h > 0 ? (h + "h " + m + "m") : (m + "m " + Math.floor(sec % 60) + "s");
  }
  function kv(label, value) { return '<div class="stats-kv"><dt>' + label + '</dt><dd>' + value + '</dd></div>'; }
  function hasExtras(l) { return l.damage_dealt !== undefined && l.damage_dealt !== null; }

  function legendExtraHtml(l) {
    var html = '<div class="stats-lg-extra">';
    if (l.level !== undefined && l.level !== null) {
      var pct = Math.round(Math.min(1, Math.max(0, l.xp_percentage || 0)) * 100);
      html += '<div class="stats-lg-xp"><span>Level ' + l.level + '</span>' +
        '<div class="stats-lg-xpbar"><i style="width:' + pct + '%"></i></div>' +
        '<span>' + fmtNum(l.xp) + ' XP</span></div>';
    }
    html += '<p class="stats-lg-sub">Combat</p><dl class="stats-kv-grid">' +
      kv("Damage dealt", fmtNum(l.damage_dealt)) + kv("Damage taken", fmtNum(l.damage_taken)) +
      kv("KOs", fmtNum(l.kos)) + kv("Falls", fmtNum(l.falls)) +
      kv("Suicides", fmtNum(l.suicides)) + kv("Team KOs", fmtNum(l.team_kos)) + '</dl>';
    html += '<p class="stats-lg-sub">Damage by source</p><dl class="stats-kv-grid">' +
      kv("Unarmed", fmtNum(l.damage_unarmed)) + kv("Thrown item", fmtNum(l.damage_thrown_item)) +
      kv("Weapon 1", fmtNum(l.damage_weapon_one)) + kv("Weapon 2", fmtNum(l.damage_weapon_two)) +
      kv("Gadgets", fmtNum(l.damage_gadgets)) + '</dl>';
    html += '<p class="stats-lg-sub">KOs by source</p><dl class="stats-kv-grid">' +
      kv("Unarmed", fmtNum(l.ko_unarmed)) + kv("Weapon 1", fmtNum(l.ko_weapon_one)) +
      kv("Weapon 2", fmtNum(l.ko_weapon_two)) + kv("Gadgets", fmtNum(l.ko_gadgets)) + '</dl>';
    html += '<p class="stats-lg-sub">Time</p><dl class="stats-kv-grid">' +
      kv("Match time", fmtTime(l.match_time)) + kv("Holding weapon 1", fmtTime(l.time_held_weapon_one)) +
      kv("Holding weapon 2", fmtTime(l.time_held_weapon_two)) + '</dl>';
    return html + '</div>';
  }

  function legendRowHtml(l) {
    var lwr = l.games ? Math.round((l.wins / l.games) * 100) : 0;
    var icon = legendIcon(l.id);
    var head =
      '<span class="stats-lg-id">' +
      (icon ? '<img class="stats-lg-icon" src="' + icon + '" alt="' + l.name + '" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
      '<span class="stats-lg-name">' + l.name + '</span></span>';
    var stats = '<span class="stats-lg-stats">' + l.games + ' games · ' + l.wins + 'W · ' + lwr + '% WR</span>';
    if (!hasExtras(l)) return '<div class="stats-legend-row">' + head + stats + '</div>';
    return '<details class="stats-legend"><summary class="stats-legend-row">' + head +
      '<span class="stats-lg-right">' + stats + '<span class="stats-lg-chevron" aria-hidden="true">▾</span></span></summary>' +
      legendExtraHtml(l) + '</details>';
  }

  function totalsHtml(legends) {
    var withData = legends.filter(hasExtras);
    if (!withData.length) return "";
    function sum(key) { return withData.reduce(function (a, l) { return a + (l[key] || 0); }, 0); }
    function box(label, value) { return '<div class="stats-detail-box"><span class="stats-label">' + label + '</span><span class="stats-value">' + value + '</span></div>'; }
    return '<p class="stats-section-label">Totals across all legends</p>' +
      '<div class="stats-detail-grid">' +
        box("Damage dealt", fmtNum(sum("damage_dealt"))) + box("Damage taken", fmtNum(sum("damage_taken"))) +
        box("KOs", fmtNum(sum("kos"))) + box("Falls", fmtNum(sum("falls"))) +
        box("Suicides", fmtNum(sum("suicides"))) + box("Team KOs", fmtNum(sum("team_kos"))) +
        box("Time played", fmtTime(sum("match_time"))) +
      '</div>';
  }

  function fetchLivePlayer(id) {
    var allUrl = API_BASE + "/player/stats?brawlhalla_id=" + id + "&mode=all";
    var rankedUrl = API_BASE + "/player/stats?brawlhalla_id=" + id + "&mode=ranked_1v1";

    return fetch(allUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (allStats) {
        return fetch(rankedUrl)
          .then(function (res) { return res.ok ? res.json() : {}; })
          .catch(function () { return {}; })
          .then(function (ranked) {
            return toRosterEntry({
              brawlhalla_id: id,
              name: allStats.name || ("#" + id),
              level: allStats.level ?? null,
              games: allStats.games ?? null,
              wins: allStats.wins ?? null,
              rating: ranked.rating ?? null,
              peak_rating: ranked.peak_rating ?? null,
              tier: ranked.tier ?? null,
              region: ranked.region ?? null,
              global_rank: ranked.global_rank ?? null,
              legends: allStats.legends || null
            });
          });
      });
  }

  function loadRoster() {
    return fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        ROSTER = (data.players || []).map(toRosterEntry);
      })
      .catch(function (err) {
        console.error("No se pudo cargar " + DATA_URL, err);
        loadFailed = true;
        ROSTER = [];
      });
  }

  function fetchLivePlayerWithRetry(id, maxAttempts, initialDelayMs) {
    maxAttempts = maxAttempts || 6;
    var delay = initialDelayMs || 2000;
    function attempt(n) {
      return fetchLivePlayer(id).catch(function (err) {
        if (n >= maxAttempts) throw err;
        return new Promise(function (resolve) { setTimeout(resolve, delay); })
          .then(function () {
            delay = Math.min(delay * 1.6, 20000);
            return attempt(n + 1);
          });
      });
    }
    return attempt(1);
  }

  function init() {
    var body = document.getElementById("stats-body");
    if (!body) return;

    var emptyState = document.getElementById("stats-empty");
    var countEl = document.getElementById("stats-count");
    var searchEl = document.getElementById("stats-search");
    var sortEl = document.getElementById("stats-sort");
    var overlay = document.getElementById("stats-overlay");
    var detail = document.getElementById("stats-detail");

    var signedSet = {};
    SIGNED_IDS.forEach(function (id) { signedSet[id] = true; });

    var pendingSignedLookups = {};

    // Agrupa los renders: con 100+ jugadores llegando de la API, esto evita reconstruir toda la tabla en cada respuesta.
    var renderTimer = null;
    function scheduleRender() {
      if (renderTimer) return;
      renderTimer = setTimeout(function () {
        renderTimer = null;
        renderTable();
        renderSigned();
      }, 300);
    }

    function renderSigned() {
      var section = document.getElementById("signed-section");
      var grid = document.getElementById("signed-grid");
      if (!section || !grid) return;

      var byId = {};
      ROSTER.forEach(function (p) { byId[p.brawlhalla_id] = p; });

      grid.innerHTML = "";
      SIGNED_IDS.forEach(function (id) {
        var p = byId[id];
        var card = document.createElement("div");
        card.className = "signed-card";
        if (p) {
          var wr = winrate(p);
          card.innerHTML =
            '<span class="signed-card-badge">Signed</span>' +
            '<span class="signed-card-name">' + p.name + '</span>' +
            '<span class="signed-card-sub">' + (p.rating !== null ? ((p.region || 'Unknown region') + ' · ' + p.rating + ' ELO · ' + Math.round(wr * 100) + '% WR') : 'No data yet') + '</span>';
          card.addEventListener("click", function () { openDetail(p); });
        } else {
          card.innerHTML =
            '<span class="signed-card-badge">Signed</span>' +
            '<span class="signed-card-name">#' + id + '</span>' +
            '<span class="signed-card-pending">Looking up live stats…</span>';

          if (!pendingSignedLookups[id]) {
            pendingSignedLookups[id] = fetchLivePlayerWithRetry(id).then(function (entry) {
              ROSTER.push(entry);
              return entry;
            });
          }
          pendingSignedLookups[id].then(function (entry) {
            var wr2 = winrate(entry);
            card.innerHTML =
              '<span class="signed-card-badge">Signed</span>' +
              '<span class="signed-card-name">' + entry.name + '</span>' +
              '<span class="signed-card-sub">' + (entry.rating !== null ? ((entry.region || 'Unknown region') + ' · ' + entry.rating + ' ELO · ' + Math.round(wr2 * 100) + '% WR') : 'No ranked data yet') + '</span>';
            card.addEventListener("click", function () { openDetail(entry); });
            scheduleRender();
          }).catch(function (err) {
            var pending = card.querySelector(".signed-card-pending");
            if (pending) pending.textContent = "Live lookup failed (" + err.message + ")";
          });
        }
        grid.appendChild(card);
      });

      section.hidden = false;
    }

    function renderTable() {
      var q = (searchEl.value || "").trim().toLowerCase();
      var sortBy = sortEl.value;

      var rows = ROSTER.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) !== -1;
      });

      rows.sort(function (a, b) {
        var aSigned = !!signedSet[a.brawlhalla_id], bSigned = !!signedSet[b.brawlhalla_id];
        if (aSigned !== bSigned) return aSigned ? -1 : 1;

        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        var aHas = a.rating !== null, bHas = b.rating !== null;
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (sortBy === "elo-desc") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "elo-asc") return (a.rating || 0) - (b.rating || 0);
        if (sortBy === "winrate-desc") return winrate(b) - winrate(a);
        return 0;
      });

      body.innerHTML = "";
      emptyState.hidden = rows.length > 0;
      emptyState.textContent = (loadFailed && !ROSTER.length)
        ? "Couldn't load player data. Try again later."
        : "No players found matching that filter.";
      var frag = document.createDocumentFragment();

      rows.forEach(function (p) {
        var wr = winrate(p);
        var card = document.createElement("div");
        card.className = "stats-card";
        var topLegend = p.legends[0];
        var icon = topLegend ? legendIcon(topLegend.id) : "";
        card.innerHTML =
          '<span class="stats-card-arrow"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></span>' +
          (icon ? '<img class="stats-card-legend-icon" src="' + icon + '" alt="' + topLegend.name + '" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
          '<span class="stats-card-name">' + p.name + '</span>' +
          '<span class="stats-card-sub">' + (p.rating !== null ? (p.region + ' · ' + p.rating + ' ELO · ' + Math.round(wr * 100) + '% WR') : 'No data yet') + '</span>';
        card.addEventListener("click", function () { openDetail(p); });
        frag.appendChild(card);
      });
      body.appendChild(frag);

      countEl.textContent = rows.length + " of " + ROSTER.length + " players";
    }

    function openDetail(p) {
      var wr = winrate(p);
      var has = p.rating !== null;
      var dash = '<span class="stats-value" style="color:#666">—</span>';
      detail.innerHTML =
        '<div class="stats-detail-head">' +
          '<div class="stats-detail-id">' +
            '<div class="stats-avatar-lg">' + initials(p.name) + '</div>' +
            '<div><h3>' + p.name + '</h3>' +
            '<div class="stats-detail-meta">' + (p.region || 'Unknown region') + (p.level !== null ? (' · Level ' + p.level) : '') + '</div></div>' +
          '</div>' +
          '<button class="stats-close" type="button" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="stats-detail-body">' +
          '<div class="stats-detail-grid">' +
            '<div class="stats-detail-box"><span class="stats-label">Current ELO</span>' + (has ? '<span class="stats-value accent">' + p.rating + '</span>' : dash) + '</div>' +
            '<div class="stats-detail-box"><span class="stats-label">Peak ELO</span>' + (has ? '<span class="stats-value">' + p.peak_rating + '</span>' : dash) + '</div>' +
            '<div class="stats-detail-box"><span class="stats-label">Tier</span>' + (has ? '<span class="stats-value hazard" style="font-size:.95rem">' + (p.tier || 'Valhallan') + '</span>' : dash) + '</div>' +
            '<div class="stats-detail-box"><span class="stats-label">Global rank</span>' + (has && p.global_rank !== null ? '<span class="stats-value">#' + p.global_rank.toLocaleString('en') + '</span>' : dash) + '</div>' +
            '<div class="stats-detail-box"><span class="stats-label">Games</span><span class="stats-value">' + p.games + '</span></div>' +
            '<div class="stats-detail-box"><span class="stats-label">Win rate</span><span class="stats-value accent">' + Math.round(wr * 100) + '%</span></div>' +
            (p.xp !== null && p.xp !== undefined ? '<div class="stats-detail-box"><span class="stats-label">Total XP</span><span class="stats-value">' + fmtNum(p.xp) + '</span></div>' : '') +
            (p.games_ranked ? '<div class="stats-detail-box"><span class="stats-label">Ranked games</span><span class="stats-value">' + fmtNum(p.games_ranked) + '</span></div>' : '') +
            (p.games_ranked ? '<div class="stats-detail-box"><span class="stats-label">Ranked win rate</span><span class="stats-value accent">' + Math.round((p.wins_ranked / p.games_ranked) * 100) + '%</span></div>' : '') +
          '</div>' +
          totalsHtml(p.legends) +
          '<p class="stats-section-label">Most played legends</p>' +
          (p.legends.length ? p.legends.map(legendRowHtml).join("") : '<p style="color:#666;font-size:.85rem;padding:6px 0">This player\'s stats haven\'t been pulled in yet.</p>') +
        '</div>';
      overlay.classList.add("open");
      detail.querySelector(".stats-close").addEventListener("click", closeDetail);
    }
    function closeDetail() { overlay.classList.remove("open"); }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeDetail(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDetail(); });

    var searchTimer = null;
    searchEl.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderTable, 120);
    });
    sortEl.addEventListener("change", renderTable);

    // La API manda en games/wins; las stats extra (daño, KOs, tiempos...) del json se conservan si la API no las trae.
    function mergeLegends(oldLegends, freshLegends) {
      if (!(freshLegends && freshLegends.length)) return oldLegends;
      var byId = {};
      (oldLegends || []).forEach(function (l) { byId[l.id] = l; });
      return freshLegends.map(function (l) {
        var merged = {}, k, o = byId[l.id];
        if (o) for (k in o) merged[k] = o[k];
        for (k in l) if (l[k] !== undefined && l[k] !== null) merged[k] = l[k];
        return merged;
      });
    }

    function mergeEntry(oldEntry, fresh) {
      // La API en vivo manda: si trajo un valor para el campo, se usa ese.
      // Solo si la API no lo consiguió (viene null) se conserva el dato de json de respaldo.
      return {
        name: fresh.name || oldEntry.name,
        brawlhalla_id: oldEntry.brawlhalla_id,
        region: fresh.region !== null ? fresh.region : oldEntry.region,
        tier: fresh.tier !== null ? fresh.tier : oldEntry.tier,
        rating: fresh.rating !== null ? fresh.rating : oldEntry.rating,
        peak_rating: fresh.peak_rating !== null ? fresh.peak_rating : oldEntry.peak_rating,
        global_rank: fresh.global_rank !== null ? fresh.global_rank : oldEntry.global_rank,
        games: fresh.games !== null && fresh.games !== undefined ? fresh.games : oldEntry.games,
        wins: fresh.wins !== null && fresh.wins !== undefined ? fresh.wins : oldEntry.wins,
        level: fresh.level !== null ? fresh.level : oldEntry.level,
        xp: fresh.xp !== null ? fresh.xp : oldEntry.xp,
        games_ranked: fresh.games_ranked !== null ? fresh.games_ranked : oldEntry.games_ranked,
        wins_ranked: fresh.wins_ranked !== null ? fresh.wins_ranked : oldEntry.wins_ranked,
        legends: mergeLegends(oldEntry.legends, fresh.legends)
      };
    }

    function refreshLiveStats() {
      var signedPlayers = ROSTER.filter(function (p) { return signedSet[p.brawlhalla_id]; });
      var restPlayers = ROSTER.filter(function (p) { return !signedSet[p.brawlhalla_id]; });

      function refreshOne(p) {
        var idx = ROSTER.indexOf(p);
        return fetchLivePlayerWithRetry(p.brawlhalla_id).then(function (fresh) {
          ROSTER[idx] = mergeEntry(ROSTER[idx], fresh);
          scheduleRender();
        }).catch(function () {});
      }

      function runPool(items, worker, limit) {
        var i = 0;
        function next() {
          if (i >= items.length) return Promise.resolve();
          return worker(items[i++]).then(next);
        }
        var runners = [];
        for (var k = 0; k < Math.min(limit, items.length); k++) runners.push(next());
        return Promise.all(runners);
      }

      signedPlayers.reduce(function (chain, p) {
        return chain.then(function () { return refreshOne(p); });
      }, Promise.resolve()).then(function () {
        runPool(restPlayers, refreshOne, 4);
      });
    }

    var started = false;
    function start() {
      if (started) return;
      started = true;
      loadRoster().then(function () {
        renderSigned();
        renderTable();
        refreshLiveStats();
      });
    }

    // La pestaña Players está oculta al entrar: no se descarga el json ni se llama a la API hasta que hace falta.
    var section = document.getElementById("roster");
    if (!section || !section.hidden) {
      start();
    } else {
      new MutationObserver(function (_, obs) {
        if (!section.hidden) { obs.disconnect(); start(); }
      }).observe(section, { attributes: true, attributeFilter: ["hidden"] });
      // adelanta la carga cuando el usuario apunta al enlace de Players
      document.querySelectorAll('[data-tab="roster"], [data-tab-link="roster"]').forEach(function (a) {
        ["pointerenter", "focus", "touchstart"].forEach(function (ev) {
          a.addEventListener(ev, start, { once: true, passive: true });
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
