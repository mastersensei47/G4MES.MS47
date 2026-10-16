/* MS47 Widgets: chat + novedades + pedidos de juegos + contador de visitas + estadísticas (Firebase Realtime Database)
   Uso en cada página:
   <script src="config.js"></script>   (define window.MS47.firebaseConfig)
   <script src="ms47-widgets.js"></script>
   Opcional: <script src="ms47-widgets.js" data-page="mi-id-de-pagina"></script> */
(function () {
  const S = document.currentScript;
  let srch = location.search; try { srch = decodeURIComponent(srch); } catch (e) {}
  const PAGE = ((S && S.dataset.page) || ((location.pathname.split('/').pop() || 'index.html') + srch))
    .replace(/[.$#\[\]\/]/g, '_').slice(0, 120);
  const GLOBAL = '_global';
  const TZ = -3;   // huso horario (horas respecto de UTC) con el que se cuentan los «días» de las estadísticas. Tiene que ser igual en admin.html
  const dayKey = () => new Date(Date.now() + TZ * 36e5).toISOString().slice(0, 10).replace(/-/g, '');
  const IS_HOME = PAGE === 'index_html';
  const IS_ITEM = /^(juego|serie)_html/.test(PAGE);   // páginas que cuentan visitas
  const SDK = 'https://www.gstatic.com/firebasejs/10.8.0/';
  const RX = { up: '👍', fire: '🔥', lol: '😂', love: '❤️', wow: '😮' };
  const EMOJIS = ['😀', '😂', '🤣', '😍', '😎', '🤔', '😅', '😭', '😡', '🥳', '👍', '👎', '🙏', '👏', '💪', '🔥', '❤️', '💀', '🎮', '🕹️', '👾', '🏆', '⚽', '🍿', '📺', '🎬', '✅', '❌', '⭐', '👀', '🤝', '🫡'];
  let SH = document;
  const $ = id => SH.getElementById(id);
  const load = src => new Promise((ok, err) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = err; document.head.appendChild(s);
  });
  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  const CSS = `
#w47{font-family:system-ui,Segoe UI,Arial,sans-serif;color:#fff;position:fixed;right:16px;bottom:16px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
#w47 *{box-sizing:border-box}
#w47 .p{width:340px;max-width:92vw;height:440px;max-height:70vh;background:rgba(14,18,24,.94);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5)}
#w47 .p[hidden],#w47 [hidden]{display:none!important}
#w47 .h{display:flex;align-items:center;gap:6px;padding:10px 12px;background:rgba(255,255,255,.06);font-size:14px}
#w47 .h b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#w47 .h .on{font-size:12px;color:#9be39b;white-space:nowrap}
#w47 button{cursor:pointer;border:0;border-radius:8px;background:#2a7f80;color:#fff;padding:6px 10px;font-size:13px}
#w47 .h button{background:transparent;padding:2px 6px;font-size:16px}
#w47 .h button.off{opacity:.45}
#w47 .b{flex:1;overflow-y:auto;padding:10px 12px;font-size:14px}
#w47 .m{margin-bottom:8px;word-break:break-word;position:relative;padding:2px 4px;border-radius:8px}
#w47 .m small{display:block;color:#7fd1d3;font-size:11px}
#w47 .m.a small{color:#ffd166}
#w47 .m.me{background:rgba(255,209,102,.14)}
#w47 .m .q{font-size:12px;color:#aab;border-left:3px solid #2a7f80;padding:1px 6px;margin:2px 0;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#w47 .mn{color:#7fd1d3;font-weight:600}
#w47 .mn.me{color:#ffd166;background:rgba(255,209,102,.18);border-radius:4px;padding:0 2px}
#w47 .m .ac{display:none;position:absolute;right:0;top:-6px;background:rgba(10,12,16,.95);border-radius:8px;padding:2px;gap:2px;flex-wrap:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.5);z-index:2}
#w47 .m:hover .ac,#w47 .m.sel .ac{display:flex}
#w47 .m .ac button{background:transparent;padding:2px 4px;margin:0;font-size:14px}
#w47 .m .ac button:hover{background:rgba(255,255,255,.15)}
#w47 .rx{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}
#w47 .rx button{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);padding:0 6px;font-size:12px;border-radius:10px}
#w47 .rx button.mine{background:rgba(42,127,128,.45);border-color:#2a7f80}
#w47 .pin{padding:7px 12px;font-size:13px;background:rgba(255,209,102,.12);border-bottom:1px solid rgba(255,209,102,.3);word-break:break-word}
#w47 .pin button{background:transparent;padding:0 4px}
#w47 .rp{display:flex;align-items:center;gap:6px;padding:5px 10px;font-size:12px;background:rgba(42,127,128,.18);border-top:1px solid rgba(255,255,255,.1)}
#w47 .rp span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#w47 .rp button{background:transparent;padding:0 4px}
#w47 .em{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;padding:6px 8px;border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.25)}
#w47 .em button{background:transparent;font-size:18px;padding:2px 0}
#w47 .em button:hover{background:rgba(255,255,255,.15)}
#w47 .f{display:flex;gap:6px;padding:8px;border-top:1px solid rgba(255,255,255,.1)}
#w47 .f input{flex:1;min-width:0;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:8px;padding:8px 10px;font-size:14px}
#w47 .f .emb{background:rgba(255,255,255,.08);padding:6px 8px;font-size:16px}
#w47 .hint{padding:0 12px 6px;font-size:12px;color:#ffb4a2;min-height:0}
#w47 .n{margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.1)}
#w47 .n.pn{background:rgba(255,209,102,.08);border-radius:8px;padding:8px;border-bottom:0}
#w47 .n h4{margin:0 0 2px;font-size:15px}
#w47 .n small{color:#8aa;font-size:11px}
#w47 .n p{margin:6px 0;white-space:pre-wrap;word-break:break-word}
#w47 .n img{max-width:100%;border-radius:8px;margin:4px 0}
#w47 .n a{display:inline-block;background:#2a7f80;color:#fff;padding:5px 10px;border-radius:8px;text-decoration:none;font-size:13px}
#w47 .bt{display:flex;gap:8px;align-items:center}
#w47 .bt button{position:relative;width:46px;height:46px;border-radius:12px;font-size:20px;background:rgba(14,18,24,.94);border:1px solid rgba(255,255,255,.18)}
#w47 .bt button.on{background:#2a7f80}
#w47 .bt i{position:absolute;top:5px;right:5px;width:10px;height:10px;border-radius:50%;background:#ff4d4d}
#w47 .vs{background:rgba(14,18,24,.94);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:0 12px;height:46px;display:flex;align-items:center;font-size:13px;white-space:nowrap}
#w47 .bnr{position:fixed;top:10px;left:50%;transform:translateX(-50%);max-width:min(94vw,640px);width:max-content;display:flex;align-items:center;gap:10px;background:rgba(14,18,24,.96);border:1px solid rgba(255,209,102,.5);border-radius:12px;padding:8px 12px;font-size:14px;box-shadow:0 6px 24px rgba(0,0,0,.5)}
#w47 .bnr span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#w47 .bnr .x{background:transparent;padding:0 4px;font-size:16px}
#w47 .qh{margin:12px 0 4px;font-size:11px;color:#8aa;text-transform:uppercase;letter-spacing:.6px}
#w47 .qh:first-child{margin-top:0}
#w47 .q1{display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid rgba(255,255,255,.08)}
#w47 .q1 .qt{flex:1;min-width:0;word-break:break-word}
#w47 .q1 .qt small{display:block;color:#8aa;font-size:11px}
#w47 .q1 button{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);padding:5px 10px;font-size:13px;white-space:nowrap}
#w47 .q1 button.mine{background:rgba(42,127,128,.45);border-color:#2a7f80}
#w47 .q1.dn .qt{opacity:.65}
#w47 .qnote{padding:8px 12px 0;font-size:12px;color:#aab}
@media(max-width:600px){
  #w47{left:10px;right:10px;bottom:10px;align-items:stretch}
  #w47 .p{width:auto;max-width:none;height:min(78vh,600px);max-height:none}
  #w47 .bt{align-self:flex-end}
  #w47 .m .ac button{padding:4px 6px}
}`;

  const HTML = `
<div class="bnr" id="w47bn2" hidden><span id="w47bt"></span><button id="w47bs">Ver</button><button class="x" id="w47bx" title="Cerrar">×</button></div>
<div class="p" id="w47n" hidden><div class="h"><b>📣 Novedades</b><button data-x="x">×</button></div><div class="b" id="w47nl"></div></div>
<div class="p" id="w47q" hidden><div class="h"><b>🎮 Pedidos de juegos</b><button data-x="x">×</button></div>
 <div class="qnote">Pedí el juego que quieras. Votá los que también querés: los más votados se hacen primero.</div>
 <div class="b" id="w47ql"></div>
 <div class="hint" id="w47qh"></div>
 <form class="f" id="w47qf"><input id="w47qi" maxlength="80" placeholder="¿Qué juego querés?" autocomplete="off"><button id="w47qb">Pedir</button></form>
</div>
<div class="p" id="w47c" hidden>
 <div class="h"><b id="w47ct">Chat</b><span class="on" id="w47on" hidden></span><button id="w47sn" title="Sonido de mensajes nuevos">🔔</button><button id="w47ch" title="Cambiar usuario">✎</button><button data-x="x">×</button></div>
 <div class="pin" id="w47pin" hidden></div>
 <div class="b" id="w47ml"></div>
 <div class="rp" id="w47rp" hidden><span id="w47rt"></span><button id="w47rx" title="Cancelar respuesta">✖</button></div>
 <div class="em" id="w47em" hidden></div>
 <div class="hint" id="w47h"></div>
 <form class="f" id="w47nu"><input id="w47ni" maxlength="20" placeholder="Elegí tu usuario" autocomplete="off"><button>Entrar</button></form>
 <form class="f" id="w47mf" hidden><button type="button" class="emb" id="w47eb" title="Emojis">😊</button><input id="w47mi" placeholder="Enviar mensaje..." autocomplete="off"><button>➤</button></form>
</div>
<div class="bt"><span class="vs" id="w47vs" hidden></span><button id="w47bn" title="Novedades">📣<i id="w47dot" hidden></i></button><button id="w47bq" title="Pedir un juego">🎮</button><button id="w47bc" title="Chat">💬<i id="w47cdot" hidden></i></button></div>`;

  async function boot() {
    const CFG = window.MS47_FIREBASE_CONFIG || (window.MS47 && window.MS47.firebaseConfig);
    if (!window.firebase) {
      await load(SDK + 'firebase-app-compat.js');
      await load(SDK + 'firebase-auth-compat.js');
      await load(SDK + 'firebase-database-compat.js');
    } else {
      if (!firebase.auth) await load(SDK + 'firebase-auth-compat.js');
      if (!firebase.database) await load(SDK + 'firebase-database-compat.js');
    }
    if (!firebase.apps.length) {
      if (!CFG) { console.error('MS47 widgets: falta window.MS47_FIREBASE_CONFIG'); return; }
      firebase.initializeApp(CFG);
    }
    const db = firebase.database();
    const TS = firebase.database.ServerValue.TIMESTAMP;
    // Estadísticas por día: stats/dias/AAAAMMDD/{v: visitas, m: mensajes de chat}
    const bump = f => db.ref('stats/dias/' + dayKey() + '/' + f).transaction(n => (n || 0) + 1).catch(() => {});

    const host = document.createElement('div'); document.body.appendChild(host);
    SH = host.attachShadow({ mode: 'open' });
    SH.innerHTML = '<style>:host{all:initial}' + CSS + '</style><div id="w47">' + HTML + '</div>';
    const root = $('w47');

    let cfg = null, isAdmin = false, room = null, built = '', refM = null, refP = null, refR = null;
    let user = ls.get('ms47w_user') || '', banned = false, first = true, newestNews = 0, ready = false;
    let replyTo = null, reactions = {}, newsItems = [], counted = false, sound = ls.get('ms47w_snd') !== '0';
    let dev = ls.get('ms47w_dev'); if (!dev) { dev = Math.random().toString(36).slice(2) + Date.now().toString(36); ls.set('ms47w_dev', dev); }
    const ml = $('w47ml'), pin = $('w47pin'), hint = t => { $('w47h').textContent = t || ''; };

    function effective(s) {
      const g = Object.assign({ chatEnabled: true, newsEnabled: true, reqEnabled: true, chatOpen: false, newsOpen: false, chatMode: 'page', showVisits: false, slow: 3, maxLen: 300, words: '', reserved: 'admin,administrador,mod,moderador' }, s.global || {});
      const p = (s.pages && s.pages[PAGE]) || {};
      ['chatEnabled', 'newsEnabled', 'reqEnabled', 'chatOpen', 'newsOpen', 'chatMode', 'showVisits'].forEach(k => { if (p[k] !== undefined && p[k] !== null && p[k] !== 'auto') g[k] = p[k]; });
      g.adminUid = s.adminUid || '';
      return g;
    }

    // ---- abrir / cerrar paneles (uno a la vez) ----
    function show(w) {   // w: 'c' (chat) | 'n' (novedades) | 'q' (pedidos) | 'x' (todo cerrado)
      $('w47c').hidden = w !== 'c'; $('w47n').hidden = w !== 'n'; $('w47q').hidden = w !== 'q';
      $('w47bc').classList.toggle('on', w === 'c'); $('w47bn').classList.toggle('on', w === 'n'); $('w47bq').classList.toggle('on', w === 'q');
      if (w === 'q') startReq();
      ss.set('w47s_' + PAGE, w);
      if (w === 'c') { ml.scrollTop = ml.scrollHeight; $('w47cdot').hidden = true; }
      if (w === 'n' && newestNews) { ls.set('ms47w_ns', newestNews); $('w47dot').hidden = true; }
    }
    const cur = () => ss.get('w47s_' + PAGE) || 'x';
    $('w47bc').onclick = () => show(cur() === 'c' ? 'x' : 'c');
    $('w47bn').onclick = () => show(cur() === 'n' ? 'x' : 'n');
    $('w47bq').onclick = () => show(cur() === 'q' ? 'x' : 'q');
    root.querySelectorAll('[data-x]').forEach(b => b.onclick = () => show('x'));
    window.MS47W = { openNews: () => show('n'), openChat: () => show('c'), openReq: () => show('q') };

    // ---- sonido ----
    const paintSnd = () => { $('w47sn').classList.toggle('off', !sound); $('w47sn').textContent = sound ? '🔔' : '🔕'; };
    paintSnd();
    $('w47sn').onclick = () => { sound = !sound; ls.set('ms47w_snd', sound ? '1' : '0'); paintSnd(); if (sound) beep(); };
    function beep() {
      try {
        const A = window.AudioContext || window.webkitAudioContext; const c = new A();
        const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination);
        o.frequency.value = 880; g.gain.setValueAtTime(.08, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .25);
        o.start(); o.stop(c.currentTime + .25); setTimeout(() => c.close(), 500);
      } catch (e) {}
    }

    // ---- conectados ahora ----
    const tab = ss.get('w47tab') || (() => { const t = Math.random().toString(36).slice(2, 8); ss.set('w47tab', t); return t; })();
    const me = db.ref('widgets/presence/' + dev + '_' + tab);
    db.ref('.info/connected').on('value', s => {
      if (s.val() === true) me.onDisconnect().remove().then(() => me.set({ t: TS, p: PAGE })).catch(() => {});
    });
    db.ref('widgets/presence').on('value', s => {
      const n = s.numChildren(); $('w47on').hidden = false; $('w47on').textContent = '👥 ' + n;
    }, () => { $('w47on').hidden = true; });

    // ---- texto con @menciones ----
    function renderText(el, text) {
      text.split(/(@[\p{L}\p{N}_.\-]{2,20})/u).forEach(part => {
        if (/^@[\p{L}\p{N}_.\-]{2,20}$/u.test(part)) {
          const sp = document.createElement('span');
          sp.className = 'mn' + (user && part.slice(1).toLowerCase() === user.toLowerCase() ? ' me' : '');
          sp.textContent = part; el.append(sp);
        } else if (part) el.append(document.createTextNode(part));
      });
    }
    const mentionsMe = t => !!user && new RegExp('@' + user.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}_.\\-])', 'iu').test(t || '');

    // ---- chat ----
    function label() { $('w47ct').textContent = (room === GLOBAL ? 'Chat global' : 'Chat de esta página') + (isAdmin ? ' [' + PAGE + ']' : ''); }
    function renderPin(p) {
      pin.hidden = !p; if (!p) return;
      pin.textContent = '📌 ' + p.u + ': ' + p.t;
      if (isAdmin) { const b = document.createElement('button'); b.textContent = '✖'; b.title = 'Quitar fijado'; b.onclick = () => db.ref('widgets/chat/' + room + '/pinned').remove(); pin.append(b); }
    }
    function setReply(m) {
      replyTo = m ? { u: m.u, t: String(m.t).slice(0, 80) } : null;
      $('w47rp').hidden = !m; if (m) { $('w47rt').textContent = '↪ ' + replyTo.u + ': ' + replyTo.t; $('w47mi').focus(); }
    }
    $('w47rx').onclick = () => setReply(null);
    function toggleRx(id, k) {
      const r = db.ref('widgets/reactions/' + room + '/' + id + '/' + k + '/' + dev);
      r.once('value').then(s => s.exists() ? r.remove() : r.set(true)).catch(() => hint('No se pudo reaccionar'));
    }
    function paintRx(id) {
      const box = $('w47x' + id); if (!box) return;
      box.innerHTML = '';
      const d = reactions[id] || {};
      Object.keys(RX).forEach(k => {
        const n = d[k] ? Object.keys(d[k]).length : 0; if (!n) return;
        const b = document.createElement('button'); b.type = 'button'; b.textContent = RX[k] + ' ' + n;
        if (d[k][dev]) b.className = 'mine';
        b.onclick = () => toggleRx(id, k); box.append(b);
      });
    }
    function act(a, id, m) {
      const r = db.ref('widgets/chat/' + room);
      if (a === 'del') { r.child('messages/' + id).remove(); db.ref('widgets/reactions/' + room + '/' + id).remove().catch(() => {}); }
      if (a === 'pin') r.child('pinned').set({ u: m.u, t: m.t, ts: m.ts });
      if (a === 'ban' && confirm('¿Bloquear a ' + m.u + ' por 24 h?')) db.ref('widgets/bans/' + m.d).set({ u: m.u, until: Date.now() + 864e5 });
    }
    function addMsg(id, m) {
      const near = ml.scrollHeight - ml.scrollTop - ml.clientHeight < 60;
      const el = document.createElement('div'); el.id = 'w47m' + id;
      el.className = 'm' + (m.admin ? ' a' : '') + (mentionsMe(m.t) ? ' me' : '');
      const h = document.createElement('small');
      h.textContent = m.u + (m.admin ? ' ★' : '') + ' · ' + new Date(m.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      el.append(h);
      if (m.r && m.r.u) { const q = document.createElement('div'); q.className = 'q'; q.textContent = '↪ ' + m.r.u + ': ' + (m.r.t || ''); el.append(q); }
      const t = document.createElement('div'); renderText(t, String(m.t || '')); el.append(t);
      const rx = document.createElement('div'); rx.className = 'rx'; rx.id = 'w47x' + id; el.append(rx);
      const c = document.createElement('span'); c.className = 'ac';
      const mk = (txt, title, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.title = title; b.onclick = e => { e.stopPropagation(); fn(); el.classList.remove('sel'); }; c.append(b); };
      mk('↩', 'Responder', () => setReply(m));
      Object.keys(RX).forEach(k => mk(RX[k], 'Reaccionar', () => toggleRx(id, k)));
      if (isAdmin) { mk('🗑', 'Borrar', () => act('del', id, m)); mk('📌', 'Fijar', () => act('pin', id, m)); mk('🚫', 'Bloquear', () => act('ban', id, m)); }
      el.append(c);
      el.onclick = () => el.classList.toggle('sel');   // en el celular: tocar el mensaje muestra las acciones
      ml.append(el); paintRx(id);
      if (near) ml.scrollTop = ml.scrollHeight;
      // aviso de mensaje nuevo (solo mensajes que llegan después de abrir la sala)
      if (ready && m.d !== dev) {
        if (cur() !== 'c') $('w47cdot').hidden = false;
        if (sound && (cur() !== 'c' || mentionsMe(m.t))) beep();
      }
    }
    function joinRoom() {
      const r = cfg.chatMode === 'global' ? GLOBAL : PAGE, key = r + '|' + isAdmin;
      if (key === built) { label(); return; }
      built = key; room = r; ready = false; reactions = {};
      if (refM) refM.off(); if (refP) refP.off(); if (refR) refR.off();
      ml.innerHTML = ''; pin.hidden = true; label();
      refM = db.ref('widgets/chat/' + r + '/messages').orderByChild('ts').limitToLast(100);
      refM.on('child_added', s => addMsg(s.key, s.val()));
      refM.on('child_removed', s => { const e = $('w47m' + s.key); if (e) e.remove(); });
      refM.once('value').then(() => { ready = true; }, () => { ready = true; });
      refP = db.ref('widgets/chat/' + r + '/pinned'); refP.on('value', s => renderPin(s.val()));
      refR = db.ref('widgets/reactions/' + r);
      refR.on('value', s => { reactions = s.val() || {}; ml.querySelectorAll('.m').forEach(e => paintRx(e.id.slice(4))); }, () => {});
    }
    function gate() { $('w47nu').hidden = !!user; $('w47mf').hidden = !user; if (user) $('w47mi').disabled = banned; }
    gate();
    $('w47ch').onclick = () => {
      const t = +ls.get('ms47w_unt') || 0;
      if (user && Date.now() - t < 600000) { hint('Podés cambiar el usuario cada 10 minutos'); return; }
      ls.del('ms47w_user'); user = ''; $('w47ni').value = ''; setReply(null); gate();
    };
    $('w47nu').onsubmit = e => {
      e.preventDefault();
      const n = $('w47ni').value.trim();
      if (!/^[\p{L}\p{N}_.\-]{2,20}$/u.test(n)) { hint('Usuario: 2 a 20 caracteres (letras, números, _ . -)'); return; }
      if (!isAdmin && (cfg && cfg.reserved || '').toLowerCase().split(',').map(x => x.trim()).includes(n.toLowerCase())) { hint('Ese nombre está reservado'); return; }
      user = n; ls.set('ms47w_user', n); ls.set('ms47w_unt', String(Date.now())); hint(''); gate(); $('w47mi').focus();
    };

    // emojis
    const em = $('w47em');
    EMOJIS.forEach(x => { const b = document.createElement('button'); b.type = 'button'; b.textContent = x; b.onclick = () => { const i = $('w47mi'); i.value += x; i.focus(); }; em.append(b); });
    $('w47eb').onclick = () => { em.hidden = !em.hidden; };

    $('w47mf').onsubmit = e => {
      e.preventDefault();
      if (banned) return;
      if (!cfg) cfg = effective({});
      const now = Date.now();
      const last = +ls.get('ms47w_last') || 0;
      if (now - last < (cfg.slow || 0) * 1000) { hint('Esperá un momento antes de enviar otro mensaje'); return; }
      let t = $('w47mi').value.trim().slice(0, cfg.maxLen || 300); if (!t) return;
      if (t === ls.get('ms47w_lt') && now - last < 60000) { hint('No repitas el mismo mensaje'); return; }
      if ((t.match(/https?:\/\/|www\./gi) || []).length > 1) { hint('Máximo 1 link por mensaje'); return; }
      (cfg.words || '').split(',').map(w => w.trim()).filter(Boolean).forEach(w => { t = t.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '***'); });
      const m = { u: user, t, ts: TS, d: dev }; if (isAdmin) m.admin = true; if (replyTo) m.r = { u: replyTo.u, t: replyTo.t };
      db.ref('widgets/chat/' + room + '/messages').push(m).then(() => {
        $('w47mi').value = ''; ls.set('ms47w_last', String(now)); ls.set('ms47w_lt', t); hint(''); setReply(null);
        if (!isAdmin) bump('m');
      }).catch(err => { console.error('MS47 widgets: no se pudo enviar', err); hint('No se pudo enviar (' + ((err && (err.code || err.message)) || 'error') + ')'); });
    };
    db.ref('widgets/bans/' + dev).on('value', s => {
      const b = s.val(); banned = !!b && b.until > Date.now();
      if (banned) hint('Estás bloqueado hasta ' + new Date(b.until).toLocaleString());
      gate();
    }, err => console.warn('MS47 widgets: no se pueden leer los bloqueos', err && err.code));

    // ---- pedidos de juegos ----
    let reqItems = [], reqOn = false;
    const normQ = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const qHint = (t, ok) => { const h = $('w47qh'); h.textContent = t || ''; h.style.color = ok ? '#9be39b' : ''; };
    const qCount = v => (v && v.votos) ? Object.keys(v.votos).length : 0;
    function qVote(k) {
      const r = db.ref('pedidos/' + k + '/votos/' + dev);
      r.once('value').then(s => s.exists() ? r.remove() : r.set(true)).catch(() => qHint('No se pudo votar'));
    }
    function paintReq() {
      const box = $('w47ql'); box.innerHTML = '';
      const pend = reqItems.filter(x => !x.v.hecho).sort((a, b) => qCount(b.v) - qCount(a.v) || (b.v.ts || 0) - (a.v.ts || 0));
      const done = reqItems.filter(x => x.v.hecho).sort((a, b) => (b.v.hechoTs || b.v.ts || 0) - (a.v.hechoTs || a.v.ts || 0)).slice(0, 10);
      if (!pend.length && !done.length) { box.textContent = 'Todavía no hay pedidos. ¡Sé el primero en pedir uno!'; return; }
      const title = t => { const h = document.createElement('div'); h.className = 'qh'; h.textContent = t; box.append(h); };
      const row = (x, ok) => {
        const el = document.createElement('div'); el.className = 'q1' + (ok ? ' dn' : '');
        const t = document.createElement('div'); t.className = 'qt'; t.textContent = x.v.juego || '';
        const sm = document.createElement('small');
        sm.textContent = ok ? '✅ Ya está hecho' : new Date(x.v.ts || Date.now()).toLocaleDateString();
        t.append(sm); el.append(t);
        if (!ok) {
          const mine = !!(x.v.votos && x.v.votos[dev]);
          const b = document.createElement('button'); b.type = 'button';
          b.textContent = '👍 ' + qCount(x.v); b.title = mine ? 'Quitar mi voto' : 'Yo también lo quiero';
          if (mine) b.className = 'mine';
          b.onclick = () => qVote(x.k); el.append(b);
        }
        box.append(el);
      };
      if (pend.length) { title('Más pedidos'); pend.forEach(x => row(x, false)); }
      if (done.length) { title('Ya hechos'); done.forEach(x => row(x, true)); }
    }
    function startReq() {   // se conecta recién cuando alguien abre el panel (así no gasta datos en cada página)
      if (reqOn) return; reqOn = true;
      db.ref('pedidos').orderByChild('ts').limitToLast(150).on('value', s => {
        reqItems = []; s.forEach(c => { const v = c.val(); if (v && v.juego) reqItems.push({ k: c.key, v }); });
        paintReq();
      }, err => { console.warn('MS47 widgets: no se pueden leer los pedidos', err && err.code); $('w47ql').textContent = 'No se pudieron cargar los pedidos.'; });
    }
    $('w47qf').onsubmit = e => {
      e.preventDefault();
      if (banned) { qHint('Estás bloqueado, no podés pedir juegos por ahora'); return; }
      const t = $('w47qi').value.trim().replace(/\s+/g, ' ').slice(0, 80);
      if (t.length < 2) { qHint('Escribí el nombre del juego'); return; }
      if (/https?:\/\/|www\./i.test(t)) { qHint('Escribí solo el nombre del juego, sin links'); return; }
      let limpio = t;
      ((cfg && cfg.words) || '').split(',').map(w => w.trim()).filter(Boolean).forEach(w => { limpio = limpio.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '***'); });
      if (limpio !== t) { qHint('Ese texto no está permitido'); return; }
      const dup = reqItems.find(x => !x.v.hecho && normQ(x.v.juego) === normQ(t));
      if (dup) {   // ya estaba pedido: se suma el voto en vez de duplicarlo
        $('w47qi').value = '';
        if (dup.v.votos && dup.v.votos[dev]) { qHint('Ya habías votado ese juego 👍', true); return; }
        db.ref('pedidos/' + dup.k + '/votos/' + dev).set(true).then(() => qHint('Ese juego ya estaba pedido: sumé tu voto 👍', true)).catch(() => qHint('No se pudo votar'));
        return;
      }
      const qd = (ls.get('ms47w_qd') || '').split('|'), usados = qd[0] === dayKey() ? (+qd[1] || 0) : 0;
      if (usados >= 3) { qHint('Hoy ya hiciste 3 pedidos. Mañana podés pedir más 🙌'); return; }
      const btn = $('w47qb'); btn.disabled = true;
      db.ref('pedidos').push({ juego: t, ts: TS, d: dev, hecho: false, votos: { [dev]: true } }).then(() => {
        $('w47qi').value = ''; ls.set('ms47w_qd', dayKey() + '|' + (usados + 1)); qHint('¡Pedido enviado! 🎮', true);
      }).catch(err => { console.error('MS47 widgets: no se pudo enviar el pedido', err); qHint('No se pudo enviar (' + ((err && (err.code || err.message)) || 'error') + ')'); })
        .then(() => { btn.disabled = false; });
    };

    // ---- novedades ----
    function paintNews() {
      const now = Date.now();
      const items = newsItems.filter(v => !v.exp || v.exp > now)
        .sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.ts - a.ts);
      const box = $('w47nl'); box.innerHTML = '';
      if (!items.length) box.textContent = 'Todavía no hay novedades.';
      items.forEach(v => {
        const n = document.createElement('div'); n.className = 'n' + (v.pin ? ' pn' : '');
        const h = document.createElement('h4'); h.textContent = (v.pin ? '📌 ' : '') + (v.title || '');
        const d = document.createElement('small'); d.textContent = new Date(v.ts).toLocaleDateString();
        n.append(h, d);
        if (v.img && /^https?:\/\//i.test(v.img)) { const i = document.createElement('img'); i.src = v.img; i.loading = 'lazy'; n.append(i); }
        if (v.body) { const p = document.createElement('p'); p.textContent = v.body; n.append(p); }
        if (v.link && /^https?:\/\//i.test(v.link)) { const a = document.createElement('a'); a.href = v.link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Ver más'; n.append(a); }
        box.append(n);
      });
      newestNews = items.reduce((mx, v) => Math.max(mx, v.ts || 0), 0);
      $('w47dot').hidden = !(newestNews > (+ls.get('ms47w_ns') || 0)) || cur() === 'n';
      // banner del inicio: novedad fijada para todo el sitio
      const bn = IS_HOME && items.find(v => v.pin && v.scope === 'global' && ls.get('ms47w_bd') !== v.k + ':' + v.ts);
      $('w47bn2').hidden = !bn;
      if (bn) { $('w47bt').textContent = '📣 ' + (bn.title || ''); $('w47bx').onclick = () => { ls.set('ms47w_bd', bn.k + ':' + bn.ts); $('w47bn2').hidden = true; }; }
    }
    $('w47bs').onclick = () => { show('n'); };
    db.ref('widgets/news').orderByChild('ts').limitToLast(40).on('value', s => {
      newsItems = []; s.forEach(c => { const v = c.val(); if (v && (v.scope === 'global' || v.scope === PAGE)) { v.k = c.key; newsItems.push(v); } });
      paintNews();
    });
    setInterval(paintNews, 60000);   // para que venzan solas

    // ---- visitas ----
    function paintVisits(n) {
      const v = $('w47vs');
      if (n !== undefined) v.dataset.n = n;
      const ok = IS_ITEM && cfg && cfg.showVisits && v.dataset.n !== undefined && v.dataset.n !== '';
      v.hidden = !ok; if (ok) v.textContent = '👁 ' + v.dataset.n;
    }
    if (IS_ITEM) db.ref('visitas/' + PAGE).on('value', s => paintVisits(s.val() || 0), () => {});
    function countVisit() {
      if (!ss.get('w47sd')) { ss.set('w47sd', '1'); bump('v'); }   // visita del día (una por sesión, en cualquier página)
      if (!IS_ITEM || ss.get('w47v_' + PAGE)) return;
      ss.set('w47v_' + PAGE, '1');
      db.ref('visitas/' + PAGE).transaction(n => (n || 0) + 1).catch(() => {});
    }

    // ---- ajustes (los maneja el panel admin) ----
    function apply(s) {
      cfg = effective(s);
      $('w47bc').hidden = !cfg.chatEnabled; $('w47bn').hidden = !cfg.newsEnabled; $('w47bq').hidden = !cfg.reqEnabled;
      joinRoom(); paintVisits();
      if (first) {
        first = false;
        if (!ss.get('w47s_' + PAGE)) show(cfg.chatEnabled && cfg.chatOpen ? 'c' : cfg.newsEnabled && cfg.newsOpen ? 'n' : 'x');
        else show(cur());
      }
      if ((!cfg.chatEnabled && cur() === 'c') || (!cfg.newsEnabled && cur() === 'n') || (!cfg.reqEnabled && cur() === 'q')) show('x');
    }
    let lastS = {};
    db.ref('widgets/settings').on('value', s => { lastS = s.val() || {}; apply(lastS); },
      err => { console.error('MS47 widgets: no se pueden leer los ajustes', err); lastS = {}; apply(lastS); });
    firebase.auth().onAuthStateChanged(u => {
      isAdmin = !!u && !u.isAnonymous && !!lastS.adminUid && u.uid === lastS.adminUid;
      if (cfg) apply(lastS);
      if (!counted) { counted = true; if (!u || u.isAnonymous) countVisit(); }   // las visitas del admin no cuentan
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
