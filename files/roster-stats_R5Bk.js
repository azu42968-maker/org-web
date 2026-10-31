(function() {
  var DATA_URL = "files/a_data/players.json";
  var API_BASE = "https://api.brawlhalla.com/v1";
  var ROSTER = [];
  var BLOCKED_NAMES = [ "truckstopburrito" ];
  function isBlockedName(n) {
    n = String(n || "").toLowerCase().replace(/\s+/g, "");
    return BLOCKED_NAMES.some(function(b) {
      return n.indexOf(b) !== -1;
    });
  }
  var loadFailed = false;
  var SIGNED_IDS = [ 60698133, 52610289, 113624741, 9921820, 119039128, 86571991, 88008517, 92980284, 129887481, 137630156, 38023342, 77600655, 129916264, 57589683 ];
  var ALT_ACCOUNTS = {
    42483385: [ 53543934 ],
    128059064: [ 13017446 ]
  };
  var STATS_ONLY_ALTS = {
    113624741: [ 68370688 ]
  };
  var STATS_ONLY_ALT_IDS = {};
  Object.keys(STATS_ONLY_ALTS).forEach(function(k) {
    STATS_ONLY_ALTS[k].forEach(function(a) {
      STATS_ONLY_ALT_IDS[a] = true;
    });
  });
  var ICON_BASE = "files/assets/legends/";
  var LEGENDS = {
    3: {
      name: "Bödvar",
      slug: "bodvar"
    },
    4: {
      name: "Cassidy",
      slug: "cassidy"
    },
    5: {
      name: "Orion",
      slug: "orion"
    },
    6: {
      name: "Lord Vraxx",
      slug: "lord vraxx"
    },
    7: {
      name: "Gnash",
      slug: "gnash"
    },
    8: {
      name: "Queen Nai",
      slug: "queen nai"
    },
    9: {
      name: "Lucien",
      slug: "lucien"
    },
    10: {
      name: "Hattori",
      slug: "hattori"
    },
    11: {
      name: "Sir Roland",
      slug: "sir roland"
    },
    12: {
      name: "Scarlet",
      slug: "scarlet"
    },
    13: {
      name: "Thatch",
      slug: "thatch"
    },
    14: {
      name: "Ada",
      slug: "ada"
    },
    15: {
      name: "Sentinel",
      slug: "sentinel"
    },
    16: {
      name: "Teros",
      slug: "teros"
    },
    17: {
      name: "Red Raptor",
      slug: "redraptor"
    },
    18: {
      name: "Ember",
      slug: "ember"
    },
    19: {
      name: "Brynn",
      slug: "brynn"
    },
    20: {
      name: "Asuri",
      slug: "asuri"
    },
    21: {
      name: "Barraza",
      slug: "barraza"
    },
    22: {
      name: "Ulgrim",
      slug: "ulgrim"
    },
    23: {
      name: "Azoth",
      slug: "azoth"
    },
    24: {
      name: "Koji",
      slug: "koji"
    },
    25: {
      name: "Diana",
      slug: "diana"
    },
    26: {
      name: "Jhala",
      slug: "jhala"
    },
    27: {
      name: "Loki",
      slug: "loki"
    },
    28: {
      name: "Kor",
      slug: "kor"
    },
    29: {
      name: "Wu Shang",
      slug: "wu shang"
    },
    30: {
      name: "Val",
      slug: "val"
    },
    31: {
      name: "Ragnir",
      slug: "ragnir"
    },
    32: {
      name: "Cross",
      slug: "cross"
    },
    33: {
      name: "Mirage",
      slug: "mirage"
    },
    34: {
      name: "Nix",
      slug: "nix"
    },
    35: {
      name: "Mordex",
      slug: "mordex"
    },
    36: {
      name: "Yumiko",
      slug: "yukimo"
    },
    37: {
      name: "Artemis",
      slug: "artemis"
    },
    38: {
      name: "Caspian",
      slug: "caspian"
    },
    39: {
      name: "Sidra",
      slug: "sidra"
    },
    40: {
      name: "Xull",
      slug: "xull"
    },
    41: {
      name: "Isaiah",
      slug: "isaiah"
    },
    42: {
      name: "Kaya",
      slug: "kaya"
    },
    43: {
      name: "Jiro",
      slug: "jiro"
    },
    44: {
      name: "Lin Fei",
      slug: "lin fei"
    },
    45: {
      name: "Zariel",
      slug: "zariel"
    },
    46: {
      name: "Rayman",
      slug: "rayman"
    },
    47: {
      name: "Dusk",
      slug: "dusk"
    },
    48: {
      name: "Fait",
      slug: "fait"
    },
    49: {
      name: "Thor",
      slug: "thor"
    },
    50: {
      name: "Petra",
      slug: "petra"
    },
    51: {
      name: "Vector",
      slug: "vector"
    },
    52: {
      name: "Volkov",
      slug: "volkov"
    },
    53: {
      name: "Onyx",
      slug: "onyx"
    },
    54: {
      name: "Jaeyun",
      slug: "jaeyun"
    },
    55: {
      name: "Mako",
      slug: "mako"
    },
    56: {
      name: "Magyar",
      slug: "magyar"
    },
    57: {
      name: "Reno",
      slug: "reno"
    },
    58: {
      name: "Munin",
      slug: "munin"
    },
    59: {
      name: "Arcadia",
      slug: "arcadia"
    },
    60: {
      name: "Ezio",
      slug: "ezio"
    },
    61: {
      name: "Seven",
      slug: "seven"
    },
    62: {
      name: "Thea",
      slug: "thea"
    },
    63: {
      name: "Tezca",
      slug: "tezca"
    },
    64: {
      name: "Vivi",
      slug: "vivi"
    },
    65: {
      name: "Imugi",
      slug: "imugi"
    },
    66: {
      name: "King Zuva",
      slug: "king zuva"
    },
    67: {
      name: "Priya",
      slug: "priya"
    },
    68: {
      name: "Ransom",
      slug: "ransom"
    },
    69: {
      name: "Lady Vera",
      slug: "lady vera"
    },
    70: {
      name: "Rupture",
      slug: "rupture"
    },
    71: {
      name: "Aurus",
      slug: "aurus"
    },
    72: {
      name: "Qinghua & Baobao",
      slug: "qinghua-baobao"
    }
  };
  function legendName(id) {
    return LEGENDS[id] ? LEGENDS[id].name : "Legend #" + id;
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
  function winrate(p) {
    return p.games ? p.wins / p.games : 0;
  }
  function toRosterEntry(p) {
    var rawLegends = p.legends || p.legends_all || [];
    var legends = rawLegends.map(function(l) {
      var legendId = l.legend_id !== undefined ? l.legend_id : l.id;
      var out = {};
      for (var k in l) out[k] = l[k];
      out.id = legendId;
      out.name = legendName(legendId);
      out.games = l.games;
      out.wins = l.wins;
      return out;
    }).filter(function(l) {
      return l.games > 0;
    }).sort(function(a, b) {
      return b.games - a.games;
    });
    return {
      name: p.name,
      brawlhalla_id: p.brawlhalla_id,
      region: p.region || null,
      tier: p.tier || null,
      rating: p.rating === undefined ? null : p.rating,
      peak_rating: p.peak_rating === undefined ? null : p.peak_rating,
      global_rank: p.global_rank === undefined ? null : p.global_rank,
      games: p.games !== undefined ? p.games : p.games_all || 0,
      wins: p.wins !== undefined ? p.wins : p.wins_all || 0,
      level: p.level === undefined ? null : p.level,
      xp: p.xp === undefined ? null : p.xp,
      games_ranked: p.games_ranked === undefined ? null : p.games_ranked,
      wins_ranked: p.wins_ranked === undefined ? null : p.wins_ranked,
      rating_2v2: p.rating_2v2 === undefined ? null : p.rating_2v2,
      peak_rating_2v2: p.peak_rating_2v2 === undefined ? null : p.peak_rating_2v2,
      tier_2v2: p.tier_2v2 || null,
      global_rank_2v2: p.global_rank_2v2 === undefined ? null : p.global_rank_2v2,
      games_2v2: p.games_2v2 === undefined ? null : p.games_2v2,
      wins_2v2: p.wins_2v2 === undefined ? null : p.wins_2v2,
      legends: legends
    };
  }
  function parse2v2(j) {
    if (!j) return {};
    var found = [];
    function walk(node, depth) {
      if (!node || typeof node !== "object" || depth > 5) return;
      if (Array.isArray(node)) {
        node.forEach(function(n) { walk(n, depth + 1); });
        return;
      }
      var r = node.rating !== undefined ? node.rating : node.elo;
      if (typeof r === "number") {
        found.push(node);
        return;
      }
      Object.keys(node).forEach(function(k) { walk(node[k], depth + 1); });
    }
    walk(j.teams !== undefined ? j.teams : j, 0);
    if (!found.length) return {};
    found.sort(function(a, b) {
      var ra = a.rating !== undefined ? a.rating : a.elo, rb = b.rating !== undefined ? b.rating : b.elo;
      return (rb || 0) - (ra || 0);
    });
    var t = found[0];
    function pick() {
      for (var i = 0; i < arguments.length; i++) if (t[arguments[i]] !== undefined && t[arguments[i]] !== null) return t[arguments[i]];
      return null;
    }
    return {
      rating_2v2: pick("rating", "elo"),
      peak_rating_2v2: pick("peak_rating", "peak", "peak_elo"),
      tier_2v2: pick("tier"),
      global_rank_2v2: pick("global_rank", "rank"),
      games_2v2: pick("games"),
      wins_2v2: pick("wins")
    };
  }
  function sub2(p) {
    return p.rating_2v2 !== null ? " · 2v2 " + p.rating_2v2 + " ELO" : "";
  }
  function fmtNum(n) {
    return n === undefined || n === null ? "—" : Number(n).toLocaleString("en");
  }
  function fmtTime(sec) {
    if (sec === undefined || sec === null) return "—";
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60);
    return h > 0 ? h + "h " + m + "m" : m + "m " + Math.floor(sec % 60) + "s";
  }
  function kv(label, value) {
    return '<div class="stats-kv"><dt>' + label + "</dt><dd>" + value + "</dd></div>";
  }
  function hasExtras(l) {
    return l.damage_dealt !== undefined && l.damage_dealt !== null;
  }
  function legendExtraHtml(l) {
    var html = '<div class="stats-lg-extra">';
    if (l.level !== undefined && l.level !== null) {
      var pct = Math.round(Math.min(1, Math.max(0, l.xp_percentage || 0)) * 100);
      html += '<div class="stats-lg-xp"><span>Level ' + l.level + "</span>" + '<div class="stats-lg-xpbar"><i style="width:' + pct + '%"></i></div>' + "<span>" + fmtNum(l.xp) + " XP</span></div>";
    }
    html += '<p class="stats-lg-sub">Combat</p><dl class="stats-kv-grid">' + kv("Damage dealt", fmtNum(l.damage_dealt)) + kv("Damage taken", fmtNum(l.damage_taken)) + kv("KOs", fmtNum(l.kos)) + kv("Falls", fmtNum(l.falls)) + kv("Suicides", fmtNum(l.suicides)) + kv("Team KOs", fmtNum(l.team_kos)) + "</dl>";
    html += '<p class="stats-lg-sub">Damage by source</p><dl class="stats-kv-grid">' + kv("Unarmed", fmtNum(l.damage_unarmed)) + kv("Thrown item", fmtNum(l.damage_thrown_item)) + kv("Weapon 1", fmtNum(l.damage_weapon_one)) + kv("Weapon 2", fmtNum(l.damage_weapon_two)) + kv("Gadgets", fmtNum(l.damage_gadgets)) + "</dl>";
    html += '<p class="stats-lg-sub">KOs by source</p><dl class="stats-kv-grid">' + kv("Unarmed", fmtNum(l.ko_unarmed)) + kv("Weapon 1", fmtNum(l.ko_weapon_one)) + kv("Weapon 2", fmtNum(l.ko_weapon_two)) + kv("Gadgets", fmtNum(l.ko_gadgets)) + "</dl>";
    html += '<p class="stats-lg-sub">Time</p><dl class="stats-kv-grid">' + kv("Match time", fmtTime(l.match_time)) + kv("Holding weapon 1", fmtTime(l.time_held_weapon_one)) + kv("Holding weapon 2", fmtTime(l.time_held_weapon_two)) + "</dl>";
    return html + "</div>";
  }
  function legendRowHtml(l) {
    var lwr = l.games ? Math.round(l.wins / l.games * 100) : 0;
    var icon = legendIcon(l.id);
    var head = '<span class="stats-lg-id">' + (icon ? '<img class="stats-lg-icon" src="' + icon + '" alt="' + l.name + '" loading="lazy" onerror="this.style.display=\'none\'">' : "") + '<span class="stats-lg-name">' + l.name + "</span></span>";
    var stats = '<span class="stats-lg-stats">' + l.games + " games · " + l.wins + "W · " + lwr + "% WR</span>";
    if (!hasExtras(l)) return '<div class="stats-legend-row">' + head + stats + "</div>";
    return '<details class="stats-legend"><summary class="stats-legend-row">' + head + '<span class="stats-lg-right">' + stats + '<span class="stats-lg-chevron" aria-hidden="true">▾</span></span></summary>' + legendExtraHtml(l) + "</details>";
  }
  function totalsHtml(legends) {
    var withData = legends.filter(hasExtras);
    if (!withData.length) return "";
    function sum(key) {
      return withData.reduce(function(a, l) {
        return a + (l[key] || 0);
      }, 0);
    }
    function box(label, value) {
      return '<div class="stats-detail-box"><span class="stats-label">' + label + '</span><span class="stats-value">' + value + "</span></div>";
    }
    return '<p class="stats-section-label">Totals across all legends</p>' + '<div class="stats-detail-grid">' + box("Damage dealt", fmtNum(sum("damage_dealt"))) + box("Damage taken", fmtNum(sum("damage_taken"))) + box("KOs", fmtNum(sum("kos"))) + box("Falls", fmtNum(sum("falls"))) + box("Suicides", fmtNum(sum("suicides"))) + box("Team KOs", fmtNum(sum("team_kos"))) + box("Time played", fmtTime(sum("match_time"))) + "</div>";
  }
  /* lenient=false: si /player/teams o ranked fallan (429, red, 5xx) el intento falla y se reintenta,
     en vez de guardar al jugador con 2v2 vacío. Solo 400/404 cuentan como "sin datos".
     lenient=true (último intento): se conforma con lo que haya para que al menos salga el 1v1. */
  function fetchLivePlayer(id, lenient) {
    var allUrl = API_BASE + "/player/stats?brawlhalla_id=" + id + "&mode=all";
    var rankedUrl = API_BASE + "/player/stats?brawlhalla_id=" + id + "&mode=ranked_1v1";
    return fetch(allUrl).then(function(res) {
      if (!res.ok) console.warn("[stats] HTTP " + res.status + " en " + allUrl);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function(allStats) {
      var doublesUrl = API_BASE + "/player/teams?brawlhalla_id=" + id;
      var doublesP = fetch(doublesUrl).then(function(res) {
        if (res.ok) return res.json();
        console.warn("[2v2] HTTP " + res.status + " en " + doublesUrl);
        if (res.status === 400 || res.status === 404 || lenient) return null;
        throw new Error("HTTP " + res.status + " en 2v2");
      }).catch(function(err) {
        if (!lenient) throw err;
        console.warn("[2v2] fallo de red/CORS en " + doublesUrl, err);
        return null;
      }).then(function(j) {
        console.log("[2v2] respuesta cruda de " + id, JSON.stringify(j));
        return parse2v2(j);
      });
      return Promise.all([ fetch(rankedUrl).then(function(res) {
        if (res.ok) return res.json();
        console.warn("[1v1] HTTP " + res.status + " en " + rankedUrl);
        if (res.status === 400 || res.status === 404 || lenient) return {};
        throw new Error("HTTP " + res.status + " en 1v1");
      }).catch(function(err) {
        if (!lenient) throw err;
        console.warn("[1v1] fallo de red/CORS en " + rankedUrl, err);
        return {};
      }), doublesP ]).then(function(pair) {
        var ranked = pair[0], d2 = pair[1];
        return toRosterEntry({
          rating_2v2: d2.rating_2v2, peak_rating_2v2: d2.peak_rating_2v2, tier_2v2: d2.tier_2v2,
          global_rank_2v2: d2.global_rank_2v2, games_2v2: d2.games_2v2, wins_2v2: d2.wins_2v2,
          brawlhalla_id: id,
          name: allStats.name || "#" + id,
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
    return fetch(DATA_URL).then(function(res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function(data) {
      ROSTER = (data.players || []).map(toRosterEntry).filter(function(p) {
        return !isBlockedName(p.name) && !STATS_ONLY_ALT_IDS[p.brawlhalla_id];
      });
    }).catch(function(err) {
      console.error("No se pudo cargar " + DATA_URL, err);
      loadFailed = true;
      ROSTER = [];
    });
  }
  function fetchLivePlayerWithRetry(id, maxAttempts, initialDelayMs) {
    maxAttempts = maxAttempts || 6;
    var delay = initialDelayMs || 2e3;
    function attempt(n) {
      return fetchLivePlayer(id, n >= maxAttempts).catch(function(err) {
        if (n >= maxAttempts) throw err;
        return new Promise(function(resolve) {
          setTimeout(resolve, delay);
        }).then(function() {
          delay = Math.min(delay * 1.6, 2e4);
          return attempt(n + 1);
        });
      });
    }
    return attempt(1);
  }
  function combineLegends(legendLists) {
    var byId = {};
    legendLists.forEach(function(list) {
      (list || []).forEach(function(l) {
        if (!byId[l.id]) {
          byId[l.id] = {
            id: l.id,
            name: l.name,
            games: 0,
            wins: 0
          };
        }
        byId[l.id].games += l.games || 0;
        byId[l.id].wins += l.wins || 0;
      });
    });
    var out = [];
    for (var k in byId) out.push(byId[k]);
    return out.sort(function(a, b) {
      return b.games - a.games;
    });
  }
  function fetchLiveForRoster(id) {
    var statAlts = STATS_ONLY_ALTS[id];
    if (statAlts && statAlts.length) {
      return fetchLivePlayerWithRetry(id).then(function(main) {
        return Promise.all(statAlts.map(function(altId) {
          return fetchLivePlayerWithRetry(altId).catch(function() {
            return null;
          });
        })).then(function(extras) {
          extras.filter(Boolean).forEach(function(x) {
            main.games = (main.games || 0) + (x.games || 0);
            main.wins = (main.wins || 0) + (x.wins || 0);
          });
          return main;
        });
      });
    }
    var altIds = ALT_ACCOUNTS[id] || [];
    if (!altIds.length) return fetchLivePlayerWithRetry(id);
    var allIds = [ id ].concat(altIds);
    return Promise.all(allIds.map(function(accId) {
      return fetchLivePlayerWithRetry(accId).catch(function() {
        return null;
      });
    })).then(function(results) {
      var found = results.filter(Boolean);
      if (!found.length) throw new Error("all accounts failed");
      var primary = found[0];
      var combined = {
        brawlhalla_id: id,
        name: primary.name,
        region: null,
        tier: null,
        rating: null,
        peak_rating: null,
        global_rank: null,
        games: 0,
        wins: 0,
        level: null,
        xp: 0,
        games_ranked: 0,
        wins_ranked: 0,
        rating_2v2: null, peak_rating_2v2: null, tier_2v2: null, global_rank_2v2: null, games_2v2: null, wins_2v2: null,
        legends: combineLegends(found.map(function(f) {
          return f.legends;
        }))
      };
      found.forEach(function(f) {
        combined.games += f.games || 0;
        combined.wins += f.wins || 0;
        combined.xp += f.xp || 0;
        combined.games_ranked += f.games_ranked || 0;
        combined.wins_ranked += f.wins_ranked || 0;
        if (f.rating !== null && (combined.rating === null || f.rating > combined.rating)) {
          combined.rating = f.rating;
          combined.peak_rating = f.peak_rating;
          combined.tier = f.tier;
          combined.region = f.region;
          combined.global_rank = f.global_rank;
        }
        if (f.rating_2v2 !== null && (combined.rating_2v2 === null || f.rating_2v2 > combined.rating_2v2)) {
          combined.rating_2v2 = f.rating_2v2;
          combined.peak_rating_2v2 = f.peak_rating_2v2;
          combined.tier_2v2 = f.tier_2v2;
          combined.global_rank_2v2 = f.global_rank_2v2;
          combined.games_2v2 = f.games_2v2;
          combined.wins_2v2 = f.wins_2v2;
        }
        if (f.level !== null && (combined.level === null || f.level > combined.level)) combined.level = f.level;
      });
      return combined;
    });
  }
  /* ===== DATOS MANUALES DE LAS TARJETAS (los que la API de Brawlhalla no da) =====
     Clave = nombre en minúsculas, sin el tag "ACD |". Para agregar un jugador, copia el bloque de "sole".
       earnings: ganancias de carrera en USD (o null para ocultar)
       region:   región mostrada arriba a la derecha
       legendId: id de la legend que sale en la tarjeta (ver LEGENDS arriba)
       art:      (opcional) ruta a una imagen propia del skin, ej. "files/assets/cards/sole.webp"
       finishes: lista de { label, mode, n } -> las barras se escalan contra el valor más alto
       prSingles / prDoubles: { rank, region } -> los cuadros de PR de abajo
       updated:  fecha mostrada arriba a la derecha                                         */
  var CARD_DATA = {
    sole: {
      earnings: 5800,
      region: "NA",
      legendId: 35,
      art: null,
      updated: "Oct 24 2026",
      finishes: [
        { label: "Silver finishes", mode: "Singles", n: 5 },
        { label: "Top 8 finishes", mode: "Singles", n: 8 },
        { label: "Top 32 finishes", mode: "Singles", n: 14 },
        { label: "Top 32 finishes", mode: "Doubles", n: 9 }
      ],
      prSingles: { rank: 11, region: "NA" },
      prDoubles: { rank: 39, region: "NA" }
    }
  };
  function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/[&<>"]/g, function(c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function cardKey(name) {
    var n = String(name || "");
    n = n.substring(n.lastIndexOf("|") + 1);
    return n.toLowerCase().replace(/\s+/g, "");
  }
  /* ===== Datos en vivo de ProStats (api.brawltools.com) =====
     Busca al jugador por nombre y rellena ganancias, finishes y PR. Si falla (CORS, sin red,
     no se encuentra), la tarjeta usa lo que haya en CARD_DATA y los datos de la API de Brawlhalla. */
  var PS_API = "https://api.brawltools.com/search";
  var PS_CACHE = {};
  function psToCardData(item) {
    var pl = item.player || item;
    var p1 = pl.pr1v1 || item.pr1v1 || {}, p2 = pl.pr2v2 || item.pr2v2 || {};
    var f = [];
    function add(label, mode, n) { if (n > 0) f.push({ label: label, mode: mode, n: n }); }
    add("Gold finishes", "Singles", p1.gold); add("Silver finishes", "Singles", p1.silver); add("Bronze finishes", "Singles", p1.bronze);
    add("Top 8 finishes", "Singles", p1.top8); add("Top 32 finishes", "Singles", p1.top32);
    add("Gold finishes", "Doubles", p2.gold); add("Silver finishes", "Doubles", p2.silver); add("Bronze finishes", "Doubles", p2.bronze);
    add("Top 8 finishes", "Doubles", p2.top8); add("Top 32 finishes", "Doubles", p2.top32);
    var earn = item.earnings !== undefined ? item.earnings : pl.earnings;
    var out = {
      region: p1.region || p2.region || null,
      updated: new Date().toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
    };
    if (earn > 0) out.earnings = earn;
    if (f.length) out.finishes = f.slice(0, 6);
    if (p1.powerRanking) out.prSingles = { rank: p1.powerRanking, region: p1.region || "" };
    if (p2.powerRanking) out.prDoubles = { rank: p2.powerRanking, region: p2.region || "" };
    return out;
  }
  function fetchProstats(p) {
    var key = cardKey(p.name);
    if (PS_CACHE[key] !== undefined) return Promise.resolve(PS_CACHE[key]);
    var manual = CARD_DATA[key] || {};
    var q = manual.search || String(p.name || "").replace(/^.*\|/, "").trim();
    return fetch(PS_API + "?query=" + encodeURIComponent(q) + "&maxResults=5").then(function(res) {
      return res.ok ? res.json() : null;
    }).then(function(j) {
      var list = (j && j.searchPlayers) || [];
      var hit = null;
      list.forEach(function(item) {
        var pl = item.player || item;
        if (!hit && cardKey(pl.name) === key) hit = item;
      });
      PS_CACHE[key] = hit ? psToCardData(hit) : null;
      return PS_CACHE[key];
    }).catch(function(err) {
      console.warn("[prostats] no se pudo cargar " + q, err);
      PS_CACHE[key] = null;
      return null;
    });
  }
  function cardData(p) {
    var key = cardKey(p.name), base = CARD_DATA[key] || null, live = PS_CACHE[key] || null;
    if (!base && !live) return null;
    var out = {};
    var k;
    if (base) for (k in base) out[k] = base[k];
    if (live) for (k in live) out[k] = live[k];
    return out;
  }
  function cardHtml(p) {
    var d = cardData(p);
    var shownName = String(p.name || "").replace(/^\s*acd\s*\|\s*/i, "");
    var isSigned = !!SIGNED_IDS.filter(function(id) { return id === p.brawlhalla_id; }).length;
    var legendId = d && d.legendId ? d.legendId : (p.legends[0] ? p.legends[0].id : null);
    var legendLabel = legendId ? legendName(legendId) : "";
    var art = d && d.art ? d.art : (legendId ? legendIcon(legendId) : "");
    var region = (d && d.region) || p.region || "";
    var updated = d && d.updated ? d.updated : new Date().toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
    var nameSize = shownName.length > 11 ? " pc-name-xlong" : shownName.length > 7 ? " pc-name-long" : "";
    var h = '<div class="pc">';
    h += '<span class="pc-drips" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    h += '<button class="pc-close" type="button" aria-label="Close">✕</button>';
    h += '<div class="pc-top"><span class="pc-chip">Acid roster</span><span class="pc-date"><b>' + esc(region) + "</b> Stats · " + esc(updated) + "</span></div>";
    h += '<div class="pc-bgname" aria-hidden="true">' + esc(shownName) + "</div>";
    if (d && d.earnings !== null && d.earnings !== undefined) {
      h += '<div class="pc-earn"><span>Career earnings</span><strong>$' + Number(d.earnings).toLocaleString("en") + "</strong></div>";
    }
    h += '<div class="pc-art' + (d && d.art ? "" : " is-icon") + '">' + (art ? '<img src="' + esc(art) + '" alt="' + esc(legendLabel) + '" onerror="this.style.display=\'none\'">' : "") + "</div>";
    h += '<div class="pc-bottom">';
    h += '<span class="pc-tag">Acid</span>';
    h += '<h3 class="pc-name' + nameSize + '">' + esc(shownName) + "</h3>";
    h += '<p class="pc-role"><i></i>' + (isSigned ? "Signed player" : "Acid member") + (legendLabel ? " / " + esc(legendLabel) : "") + "</p>";
    var rows = [];
    if (d && d.finishes && d.finishes.length) {
      var max = Math.max.apply(null, d.finishes.map(function(f) { return f.n; })) || 1;
      rows = d.finishes.map(function(f) {
        return { label: f.label, mode: f.mode, text: "×" + f.n, pct: f.n / max * 100 };
      });
    }
    var key = [];
    if (p.rating !== null) key.push({ v: p.rating, l: "1v1 ELO" });
    if (p.peak_rating !== null) key.push({ v: p.peak_rating, l: "Peak" });
    if (p.rating_2v2 !== null) key.push({ v: p.rating_2v2, l: "2v2 ELO" });
    if (p.games) key.push({ v: Math.round(winrate(p) * 100) + "%", l: "Win rate" });
    if (key.length) {
      h += '<div class="pc-key">' + key.map(function(k) {
        return '<div><strong>' + esc(k.v) + "</strong><span>" + esc(k.l) + "</span></div>";
      }).join("") + "</div>";
    } else if (!rows.length) {
      h += '<p class="pc-empty">Stats not pulled in yet.</p>';
    }
    if (rows.length) {
      h += '<div class="pc-bars">' + rows.map(function(r) {
        return '<div class="pc-bar"><div class="pc-bar-head"><span>' + esc(r.label) + " <small>" + esc(r.mode) + "</small></span><b>" + esc(r.text) + '</b></div><div class="pc-bar-track"><i style="width:' + Math.max(4, Math.min(100, r.pct)).toFixed(1) + '%"></i></div></div>';
      }).join("") + "</div>";
    }
    var boxes = [];
    if (d && d.prSingles) boxes.push({ big: "#" + d.prSingles.rank, label: "Singles PR (" + d.prSingles.region + ")" });
    else if (p.global_rank !== null) boxes.push({ big: "#" + p.global_rank.toLocaleString("en"), label: "Global rank 1v1" });
    if (d && d.prDoubles) boxes.push({ big: "#" + d.prDoubles.rank, label: "Doubles PR (" + d.prDoubles.region + ")" });
    else if (p.global_rank_2v2 !== null) boxes.push({ big: "#" + p.global_rank_2v2.toLocaleString("en"), label: "Global rank 2v2" });
    if (boxes.length) {
      h += '<div class="pc-prs">' + boxes.map(function(b) {
        return '<div class="pc-pr"><strong>' + esc(b.big) + "</strong><span>" + esc(b.label) + "</span></div>";
      }).join("") + "</div>";
    }
    h += '<p class="pc-foot">' + (d ? "Stats via Brawlhalla ProStats" : "Stats via official Brawlhalla API") + "</p>";
    h += '<button class="pc-full" type="button">View full stats →</button>';
    h += "</div></div>";
    return h;
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
    if (sortEl && !sortEl.querySelector('[value="elo2-desc"]')) {
      var opt = document.createElement("option");
      opt.value = "elo2-desc";
      opt.textContent = "2v2 ELO: high to low";
      sortEl.appendChild(opt);
    }
    var signedSet = {};
    SIGNED_IDS.forEach(function(id) {
      signedSet[id] = true;
    });
    var pendingSignedLookups = {};
    var renderTimer = null;
    function scheduleRender() {
      if (renderTimer) return;
      renderTimer = setTimeout(function() {
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
      ROSTER.forEach(function(p) {
        byId[p.brawlhalla_id] = p;
      });
      grid.innerHTML = "";
      SIGNED_IDS.forEach(function(id) {
        var p = byId[id];
        if (p && isBlockedName(p.name)) return;
        var card = document.createElement("div");
        card.className = "signed-card";
        if (p) {
          var wr = winrate(p);
          card.innerHTML = '<span class="signed-card-badge">Signed</span>' + '<span class="signed-card-name">' + p.name + "</span>" + '<span class="signed-card-sub">' + (p.rating !== null ? (p.region || "Unknown region") + " · " + p.rating + " ELO · " + Math.round(wr * 100) + "% WR" + sub2(p) : p.rating_2v2 !== null ? "2v2 " + p.rating_2v2 + " ELO" : "No data yet") + "</span>";
          card.addEventListener("click", function() {
            openDetail(p);
          });
        } else {
          card.innerHTML = '<span class="signed-card-badge">Signed</span>' + '<span class="signed-card-name">#' + id + "</span>" + '<span class="signed-card-pending">Looking up live stats…</span>';
          if (!pendingSignedLookups[id]) {
            pendingSignedLookups[id] = fetchLiveForRoster(id).then(function(entry) {
              ROSTER.push(entry);
              return entry;
            });
          }
          pendingSignedLookups[id].then(function(entry) {
            if (isBlockedName(entry.name)) {
              ROSTER = ROSTER.filter(function(r) {
                return r !== entry;
              });
              card.remove();
              return;
            }
            var wr2 = winrate(entry);
            card.innerHTML = '<span class="signed-card-badge">Signed</span>' + '<span class="signed-card-name">' + entry.name + "</span>" + '<span class="signed-card-sub">' + (entry.rating !== null ? (entry.region || "Unknown region") + " · " + entry.rating + " ELO · " + Math.round(wr2 * 100) + "% WR" + sub2(entry) : entry.rating_2v2 !== null ? "2v2 " + entry.rating_2v2 + " ELO" : "No ranked data yet") + "</span>";
            card.addEventListener("click", function() {
              openDetail(entry);
            });
            scheduleRender();
          }).catch(function(err) {
            delete pendingSignedLookups[id];
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
      var rows = ROSTER.filter(function(p) {
        return !isBlockedName(p.name) && p.name.toLowerCase().indexOf(q) !== -1;
      });
      rows.sort(function(a, b) {
        var aSigned = !!signedSet[a.brawlhalla_id], bSigned = !!signedSet[b.brawlhalla_id];
        if (aSigned !== bSigned) return aSigned ? -1 : 1;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "elo2-desc") {
          var a2 = a.rating_2v2 !== null, b2 = b.rating_2v2 !== null;
          if (a2 !== b2) return a2 ? -1 : 1;
          return (b.rating_2v2 || 0) - (a.rating_2v2 || 0);
        }
        var aHas = a.rating !== null, bHas = b.rating !== null;
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (sortBy === "elo-desc") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "elo-asc") return (a.rating || 0) - (b.rating || 0);
        if (sortBy === "winrate-desc") return winrate(b) - winrate(a);
        return 0;
      });
      body.innerHTML = "";
      emptyState.hidden = rows.length > 0;
      emptyState.textContent = loadFailed && !ROSTER.length ? "Couldn't load player data. Try again later." : "No players found matching that filter.";
      var frag = document.createDocumentFragment();
      rows.forEach(function(p) {
        var wr = winrate(p);
        var card = document.createElement("div");
        card.className = "stats-card";
        var topLegend = p.legends[0];
        var icon = topLegend ? legendIcon(topLegend.id) : "";
        card.innerHTML = '<span class="stats-card-arrow"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></span>' + (icon ? '<img class="stats-card-legend-icon" src="' + icon + '" alt="' + topLegend.name + '" loading="lazy" onerror="this.style.display=\'none\'">' : "") + '<span class="stats-card-name">' + p.name + "</span>" + '<span class="stats-card-sub">' + (p.rating !== null ? p.region + " · " + p.rating + " ELO · " + Math.round(wr * 100) + "% WR" + sub2(p) : p.rating_2v2 !== null ? "2v2 " + p.rating_2v2 + " ELO" : "No data yet") + "</span>";
        card.addEventListener("click", function() {
          openDetail(p);
        });
        frag.appendChild(card);
      });
      body.appendChild(frag);
      countEl.textContent = rows.length + " of " + ROSTER.length + " players";
    }
    function fullBodyHtml(p) {
      var wr = winrate(p);
      var has = p.rating !== null;
      var dash = '<span class="stats-value" style="color:#666">—</span>';
      var out = '<div class="stats-detail-body">' + '<div class="stats-detail-grid">' + '<div class="stats-detail-box"><span class="stats-label">Current ELO</span>' + (has ? '<span class="stats-value accent">' + p.rating + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">Peak ELO</span>' + (has ? '<span class="stats-value">' + p.peak_rating + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">Tier</span>' + (has ? '<span class="stats-value hazard" style="font-size:.95rem">' + (p.tier || "Valhallan") + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">Global rank</span>' + (has && p.global_rank !== null ? '<span class="stats-value">#' + p.global_rank.toLocaleString("en") + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">2v2 ELO</span>' + (p.rating_2v2 !== null ? '<span class="stats-value accent">' + p.rating_2v2 + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">2v2 Peak</span>' + (p.peak_rating_2v2 !== null ? '<span class="stats-value">' + p.peak_rating_2v2 + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">2v2 Tier</span>' + (p.tier_2v2 ? '<span class="stats-value hazard" style="font-size:.95rem">' + p.tier_2v2 + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">2v2 Rank</span>' + (p.global_rank_2v2 !== null ? '<span class="stats-value">#' + p.global_rank_2v2.toLocaleString("en") + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">2v2 Games</span>' + (p.games_2v2 ? '<span class="stats-value">' + fmtNum(p.games_2v2) + "</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">2v2 Win rate</span>' + (p.games_2v2 ? '<span class="stats-value accent">' + Math.round(p.wins_2v2 / p.games_2v2 * 100) + "%</span>" : dash) + "</div>" + '<div class="stats-detail-box"><span class="stats-label">Games</span><span class="stats-value">' + p.games + "</span></div>" + '<div class="stats-detail-box"><span class="stats-label">Win rate</span><span class="stats-value accent">' + Math.round(wr * 100) + "%</span></div>" + (p.xp !== null && p.xp !== undefined ? '<div class="stats-detail-box"><span class="stats-label">Total XP</span><span class="stats-value">' + fmtNum(p.xp) + "</span></div>" : "") + (p.games_ranked ? '<div class="stats-detail-box"><span class="stats-label">Ranked games</span><span class="stats-value">' + fmtNum(p.games_ranked) + "</span></div>" : "") + (p.games_ranked ? '<div class="stats-detail-box"><span class="stats-label">Ranked win rate</span><span class="stats-value accent">' + Math.round(p.wins_ranked / p.games_ranked * 100) + "%</span></div>" : "") + "</div>" + totalsHtml(p.legends) + '<p class="stats-section-label">Most played legends</p>' + (p.legends.length ? p.legends.map(legendRowHtml).join("") : "<p style=\"color:#666;font-size:.85rem;padding:6px 0\">This player's stats haven't been pulled in yet.</p>") + "</div>";
      out = out.replace(/<div class="stats-detail-box"><span class="stats-label">(Current ELO|Peak ELO|Tier|2v2 ELO|Win rate)<\/span>.*?<\/div>/g, "");
      return out;
    }
    var openToken = 0;
    function noBtn(html) {
      return html.replace('<button class="pc-full" type="button">View full stats →</button>', "");
    }
    function openDetail(p) {
      var token = ++openToken;
      detail.classList.add("is-card");
      detail.innerHTML = noBtn(cardHtml(p)) + '<button class="pc-toggle" type="button" aria-expanded="false">All stats <span aria-hidden="true">▾</span></button><div class="pc-stats" hidden>' + fullBodyHtml(p) + "</div>";
      overlay.classList.add("open");
      overlay.scrollTop = 0;
      detail.querySelector(".pc-close").addEventListener("click", closeDetail);
      var tg = detail.querySelector(".pc-toggle"), panel = detail.querySelector(".pc-stats");
      tg.addEventListener("click", function() {
        var open = panel.hidden;
        panel.hidden = !open;
        tg.setAttribute("aria-expanded", String(open));
        tg.firstChild.nodeValue = open ? "Hide stats " : "All stats ";
        tg.lastChild.textContent = open ? "▴" : "▾";
        if (open) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      if (PS_CACHE[cardKey(p.name)] === undefined) {
        fetchProstats(p).then(function(live) {
          if (!live || token !== openToken) return;
          var cardEl = detail.querySelector(".pc");
          if (!cardEl) return;
          cardEl.outerHTML = noBtn(cardHtml(p));
          detail.querySelector(".pc-close").addEventListener("click", closeDetail);
        });
      }
    }
    function closeDetail() {
      overlay.classList.remove("open");
    }
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) closeDetail();
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") closeDetail();
    });
    var searchTimer = null;
    searchEl.addEventListener("input", function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderTable, 120);
    });
    sortEl.addEventListener("change", renderTable);
    function mergeLegends(oldLegends, freshLegends) {
      if (!(freshLegends && freshLegends.length)) return oldLegends;
      var byId = {};
      (oldLegends || []).forEach(function(l) {
        byId[l.id] = l;
      });
      return freshLegends.map(function(l) {
        var merged = {}, k, o = byId[l.id];
        if (o) for (k in o) merged[k] = o[k];
        for (k in l) if (l[k] !== undefined && l[k] !== null) merged[k] = l[k];
        return merged;
      });
    }
    function mergeEntry(oldEntry, fresh) {
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
        rating_2v2: fresh.rating_2v2 !== null ? fresh.rating_2v2 : oldEntry.rating_2v2,
        peak_rating_2v2: fresh.peak_rating_2v2 !== null ? fresh.peak_rating_2v2 : oldEntry.peak_rating_2v2,
        tier_2v2: fresh.tier_2v2 !== null ? fresh.tier_2v2 : oldEntry.tier_2v2,
        global_rank_2v2: fresh.global_rank_2v2 !== null ? fresh.global_rank_2v2 : oldEntry.global_rank_2v2,
        games_2v2: fresh.games_2v2 !== null ? fresh.games_2v2 : oldEntry.games_2v2,
        wins_2v2: fresh.wins_2v2 !== null ? fresh.wins_2v2 : oldEntry.wins_2v2,
        legends: mergeLegends(oldEntry.legends, fresh.legends)
      };
    }
    function refreshLiveStats() {
      var signedPlayers = ROSTER.filter(function(p) {
        return signedSet[p.brawlhalla_id];
      });
      var restPlayers = ROSTER.filter(function(p) {
        return !signedSet[p.brawlhalla_id];
      });
      var failedIds = {};
      function findIdx(id) {
        for (var i = 0; i < ROSTER.length; i++) if (ROSTER[i].brawlhalla_id === id) return i;
        return -1;
      }
      function refreshOne(p) {
        var id = p.brawlhalla_id;
        return fetchLiveForRoster(id).then(function(fresh) {
          delete failedIds[id];
          var idx = findIdx(id);
          if (isBlockedName(fresh.name)) {
            if (idx >= 0) ROSTER.splice(idx, 1);
            scheduleRender();
            return;
          }
          if (idx >= 0) ROSTER[idx] = mergeEntry(ROSTER[idx], fresh);
          scheduleRender();
        }).catch(function(err) {
          failedIds[id] = true;
          console.warn("[refresh] fallo con " + id, err);
        });
      }
      function missingStats(p) {
        return !!failedIds[p.brawlhalla_id] || (p.rating === null && p.rating_2v2 === null);
      }
      function lostSignedIds() {
        return SIGNED_IDS.filter(function(id) {
          return findIdx(id) < 0 && !pendingSignedLookups[id];
        });
      }
      // Reintenta (hasta 5 rondas, con espera creciente) a quienes siguen sin mostrar stats
      function retryMissing(round) {
        var todo = ROSTER.filter(missingStats);
        var lost = lostSignedIds();
        if (!todo.length && !lost.length) return;
        if (round > 5) {
          console.warn("[refresh] sin stats tras 5 rondas de reintento:", todo.map(function(p) { return p.name; }));
          return;
        }
        var delay = Math.min(60000, 10000 * Math.pow(2, round - 1));
        setTimeout(function() {
          if (lostSignedIds().length) scheduleRender();
          runPool(ROSTER.filter(missingStats), refreshOne, 3).then(function() {
            retryMissing(round + 1);
          });
        }, delay);
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
      signedPlayers.reduce(function(chain, p) {
        return chain.then(function() {
          return refreshOne(p);
        });
      }, Promise.resolve()).then(function() {
        return runPool(restPlayers, refreshOne, 4);
      }).then(function() {
        retryMissing(1);
      });
    }
    var started = false;
    function start() {
      if (started) return;
      started = true;
      loadRoster().then(function() {
        renderSigned();
        renderTable();
        refreshLiveStats();
      });
    }
    var section = document.getElementById("roster");
    if (!section || !section.hidden) {
      start();
    } else {
      new MutationObserver(function(_, obs) {
        if (!section.hidden) {
          obs.disconnect();
          start();
        }
      }).observe(section, {
        attributes: true,
        attributeFilter: [ "hidden" ]
      });
      document.querySelectorAll('[data-tab="roster"], [data-tab-link="roster"]').forEach(function(a) {
        [ "pointerenter", "focus", "touchstart" ].forEach(function(ev) {
          a.addEventListener(ev, start, {
            once: true,
            passive: true
          });
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