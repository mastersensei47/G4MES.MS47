/* ============================================================
   ESTÉTICA COMPARTIDA - MS47
   Lo usan el panel admin (para editar) y las páginas públicas
   (index, categoria, juego, serie) para aplicar la estética.

   Cómo se guarda (Firebase, dentro de "config" para no tocar las reglas):
     config/temas/global          → estética general de todo el sitio
     config/temas/tipo_juego      → todas las páginas de juegos
     config/temas/tipo_serie      → todas las series / películas
     config/temas/tipo_categoria  → todas las categorías
     config/temas/home            → solo la página de inicio
     config/temas/juego__<slug>   → un juego puntual
     config/temas/serie__<slug>   → una serie puntual
     config/temas/cat__<slug>     → una categoría puntual

   Orden de prioridad (gana el último):
     general → tipo → página
   Cada nivel guarda solo los campos que el admin marcó ("v").
   Si una página tiene heredar:false, ignora los niveles de arriba
   y parte del diseño original.
   ============================================================ */
(function () {

  // ---------- Fuentes disponibles (Google Fonts) ----------
  const FUENTES = {
    "":          { n: "Original de cada página" },
    inter:       { n: "Inter",             css: "'Inter',Arial,sans-serif",            gf: "Inter:wght@400;500;600;700;800" },
    poppins:     { n: "Poppins",           css: "'Poppins',Arial,sans-serif",          gf: "Poppins:wght@400;600;700;800" },
    montserrat:  { n: "Montserrat",        css: "'Montserrat',Arial,sans-serif",       gf: "Montserrat:wght@400;600;700;900" },
    roboto:      { n: "Roboto",            css: "'Roboto',Arial,sans-serif",           gf: "Roboto:wght@400;500;700;900" },
    nunito:      { n: "Nunito (redondeada)", css: "'Nunito',Arial,sans-serif",         gf: "Nunito:wght@400;600;700;800" },
    oswald:      { n: "Oswald (condensada)", css: "'Oswald',Arial,sans-serif",         gf: "Oswald:wght@400;500;700" },
    bebas:       { n: "Bebas Neue (títulos)", css: "'Bebas Neue',Arial,sans-serif",    gf: "Bebas+Neue" },
    orbitron:    { n: "Orbitron (futurista)", css: "'Orbitron',Arial,sans-serif",      gf: "Orbitron:wght@400;600;700;900" },
    rajdhani:    { n: "Rajdhani (gamer)",  css: "'Rajdhani',Arial,sans-serif",         gf: "Rajdhani:wght@400;600;700" },
    pressstart:  { n: "Press Start 2P (retro)", css: "'Press Start 2P',monospace",     gf: "Press+Start+2P" },
    firacode:    { n: "Fira Code (código)", css: "'Fira Code',monospace",              gf: "Fira+Code:wght@400;600;700" },
    playfair:    { n: "Playfair Display (elegante)", css: "'Playfair Display',Georgia,serif", gf: "Playfair+Display:wght@400;600;700;800" },
    lora:        { n: "Lora (serif)",      css: "'Lora',Georgia,serif",                gf: "Lora:wght@400;600;700" },
    arial:       { n: "Arial (sistema)",   css: "Arial,Helvetica,sans-serif" },
    georgia:     { n: "Georgia (sistema)", css: "Georgia,'Times New Roman',serif" },
    courier:     { n: "Courier (sistema)", css: "'Courier New',monospace" }
  };

  // ---------- Campos editables (el admin arma el formulario con esto) ----------
  // t: color | rango | sel | fuente | bool | url | area
  const GRUPOS = [
    { id: "colores", titulo: "🎨 Colores", campos: [
      { id: "acento",     t: "color", l: "Color principal (acento)",            d: "#ff2b3d" },
      { id: "acento2",    t: "color", l: "Color secundario",                    d: "#00e5c7" },
      { id: "fondo",      t: "color", l: "Fondo de la página",                  d: "#0a0a0b" },
      { id: "tarjeta",    t: "color", l: "Fondo de tarjetas y bloques",         d: "#151517" },
      { id: "tarjeta2",   t: "color", l: "Fondo de elementos internos",         d: "#1b1b1e" },
      { id: "texto",      t: "color", l: "Color del texto",                     d: "#f2f2f2" },
      { id: "textoSuave", t: "color", l: "Texto secundario",                    d: "#9a9aa0" },
      { id: "borde",      t: "color", l: "Color de los bordes",                 d: "#262629" }
    ]},
    { id: "fondo", titulo: "🖼️ Fondo de la página", campos: [
      { id: "fondoTipo",      t: "sel",   l: "Tipo de fondo", d: "color",
        o: [["color", "Color liso (usa «Fondo de la página»)"], ["degradado", "Degradado"], ["imagen", "Imagen"]] },
      { id: "fondoColor2",    t: "color", l: "Segundo color del degradado", d: "#1a1a2e" },
      { id: "fondoAngulo",    t: "rango", l: "Ángulo del degradado", min: 0, max: 360, step: 15, u: "°", d: 160 },
      { id: "fondoImagen",    t: "url",   l: "Imagen de fondo (link o nombre de archivo del repositorio)", d: "" },
      { id: "fondoOscuridad", t: "rango", l: "Oscurecer la imagen de fondo", min: 0, max: 90, step: 5, u: "%", d: 50 },
      { id: "fondoFijo",      t: "bool",  l: "Fondo fijo (no se mueve al bajar)", d: true }
    ]},
    { id: "texto", titulo: "✍️ Texto", campos: [
      { id: "fuenteTitulos", t: "fuente", l: "Fuente de los títulos", d: "" },
      { id: "fuenteTexto",   t: "fuente", l: "Fuente del texto",      d: "" },
      { id: "tamano",        t: "rango",  l: "Tamaño general del contenido", min: 80, max: 130, step: 5, u: "%", d: 100 },
      { id: "mayusc",        t: "bool",   l: "Títulos en MAYÚSCULAS", d: false }
    ]},
    { id: "formas", titulo: "🧩 Formas y efectos", campos: [
      { id: "radio",        t: "rango", l: "Redondeo de esquinas", min: 0, max: 32, step: 1, u: "px", d: 12 },
      { id: "bordeGrosor",  t: "rango", l: "Grosor de bordes",     min: 0, max: 4,  step: 1, u: "px", d: 1 },
      { id: "estiloTarjeta",t: "sel",   l: "Estilo de tarjetas y bloques", d: "original",
        o: [["original", "Original"], ["vidrio", "Vidrio (translúcido)"], ["contorno", "Solo contorno"]] },
      { id: "brillo",       t: "rango", l: "Resplandor al pasar el mouse", min: 0, max: 60, step: 5, u: "px", d: 20 },
      { id: "animHover",    t: "bool",  l: "Efecto de zoom / levantar al pasar el mouse", d: true },
      { id: "animEntrada",  t: "bool",  l: "Animación suave al cargar la página", d: false }
    ]},
    { id: "estructura", titulo: "📐 Estructura", campos: [
      { id: "ancho",     t: "sel",  l: "Ancho del contenido", d: "normal",
        o: [["compacto", "Compacto"], ["normal", "Normal (original)"], ["ancho", "Ancho"], ["completo", "Pantalla completa"]] },
      { id: "navVisible",t: "bool", l: "Mostrar la barra superior", d: true },
      { id: "navEstilo", t: "sel",  l: "Estilo de la barra superior", d: "original",
        o: [["original", "Original"], ["vidrio", "Vidrio"], ["solido", "Sólida"], ["transparente", "Transparente"]] }
    ]},
    { id: "avanzado", titulo: "🛠️ Avanzado", campos: [
      { id: "cssExtra", t: "area", l: "CSS propio (opcional, para quien sabe)", d: "" }
    ]}
  ];

  const CAMPOS = [];
  GRUPOS.forEach(g => g.campos.forEach(c => CAMPOS.push(c)));

  // ---------- Combinaciones listas para usar ----------
  const PRESETS = [
    { id: "clasico",  n: "🔴 Rojo clásico", v: { acento: "#ff2b3d", acento2: "#00e5c7", fondo: "#0a0a0b", tarjeta: "#151517", tarjeta2: "#1b1b1e", texto: "#f2f2f2", textoSuave: "#9a9aa0", borde: "#262629" } },
    { id: "neon",     n: "🔵 Neón cian", v: { acento: "#00e5ff", acento2: "#ff2bd6", fondo: "#05060f", tarjeta: "#0d1020", tarjeta2: "#151a33", texto: "#eaf6ff", textoSuave: "#8a94b8", borde: "#1f2850", brillo: 30, fuenteTitulos: "orbitron" } },
    { id: "morado",   n: "🟣 Morado místico", v: { acento: "#a855f7", acento2: "#22d3ee", fondo: "#0b0714", tarjeta: "#150d24", tarjeta2: "#1d1330", texto: "#f3eaff", textoSuave: "#a493c4", borde: "#2c1d4a", fondoTipo: "degradado", fondoColor2: "#1b0b3a", fondoAngulo: 160, brillo: 25 } },
    { id: "hacker",   n: "🟢 Verde hacker", v: { acento: "#22c55e", acento2: "#a3e635", fondo: "#020a04", tarjeta: "#07140a", tarjeta2: "#0c1f10", texto: "#d1fae5", textoSuave: "#6ba283", borde: "#14301b", fuenteTitulos: "firacode", fuenteTexto: "firacode", radio: 4 } },
    { id: "arcade",   n: "🕹️ Retro arcade", v: { acento: "#ffcc00", acento2: "#ff3366", fondo: "#120b2e", tarjeta: "#1d1245", tarjeta2: "#271a5c", texto: "#fff7d6", textoSuave: "#b9a8f0", borde: "#4630a8", fuenteTitulos: "pressstart", radio: 0, bordeGrosor: 2, mayusc: true } },
    { id: "dorado",   n: "🟡 Dorado elegante", v: { acento: "#d4af37", acento2: "#f5e6a8", fondo: "#0c0a06", tarjeta: "#17130b", tarjeta2: "#211b0f", texto: "#f7f1de", textoSuave: "#a8997a", borde: "#3a2f17", fuenteTitulos: "playfair", radio: 6 } },
    { id: "claro",    n: "⚪ Claro", v: { acento: "#e11d48", acento2: "#0ea5e9", fondo: "#f4f4f7", tarjeta: "#ffffff", tarjeta2: "#ececf1", texto: "#15151a", textoSuave: "#666672", borde: "#d9d9e2", estiloTarjeta: "original", brillo: 0 } },
    { id: "vidrio",   n: "🪟 Vidrio sobre degradado", v: { acento: "#38bdf8", acento2: "#f472b6", fondo: "#0f172a", tarjeta: "#1e293b", tarjeta2: "#334155", texto: "#f1f5f9", textoSuave: "#94a3b8", borde: "#475569", fondoTipo: "degradado", fondoColor2: "#312e81", fondoAngulo: 135, estiloTarjeta: "vidrio", radio: 18, navEstilo: "vidrio" } }
  ];

  // ---------- Utilidades de validación ----------
  const MAPA_VARS = { acento: "--accent", acento2: "--accent2", fondo: "--bg", tarjeta: "--card", tarjeta2: "--card2", texto: "--text", textoSuave: "--muted", borde: "--line" };

  function numero(x, min, max, def) {
    x = Number(x);
    if (!isFinite(x)) return def;
    return Math.min(max, Math.max(min, x));
  }
  function colorOk(c) {
    c = String(c == null ? "" : c).trim();
    return /^#[0-9a-f]{3,8}$/i.test(c) ? c : "";
  }
  function urlOk(u) {
    u = String(u == null ? "" : u).trim();
    return (u && !/^\s*(javascript|data|vbscript):/i.test(u)) ? u : "";
  }
  function urlCss(u) { return u.replace(/\\/g, "%5C").replace(/"/g, "%22").replace(/[\r\n]/g, ""); }

  // Deja solo campos válidos (nunca se confía en lo que viene de la base)
  function limpiar(v) {
    const out = {};
    v = v || {};
    CAMPOS.forEach(c => {
      if (!(c.id in v)) return;
      const x = v[c.id];
      if (c.t === "color") { const k = colorOk(x); if (k) out[c.id] = k; }
      else if (c.t === "rango") out[c.id] = numero(x, c.min, c.max, c.d);
      else if (c.t === "sel") { if (c.o.some(o => o[0] === x)) out[c.id] = x; }
      else if (c.t === "fuente") { if (x === "" || Object.prototype.hasOwnProperty.call(FUENTES, x)) out[c.id] = x; }
      else if (c.t === "bool") out[c.id] = (x === true || x === "true");
      else if (c.t === "url") { const k = urlOk(x); if (k) out[c.id] = k; }
      else if (c.t === "area") { const k = String(x == null ? "" : x).trim(); if (k) out[c.id] = k.slice(0, 6000); }
    });
    return out;
  }

  // ---------- Herencia: general → tipo → página ----------
  function niveles(clave, tipo) {
    const n = ["global"];
    if (clave === "global") return n;
    if (tipo) n.push("tipo_" + tipo);
    if (n[n.length - 1] !== clave) n.push(clave);
    return n;
  }

  // sinPropio: calcula lo que se hereda (sin contar el último nivel). Lo usa el editor.
  function resolver(temas, clave, tipo, sinPropio) {
    temas = temas || {};
    const lv = niveles(clave, tipo);
    if (sinPropio) lv.pop();
    let v = {};
    lv.forEach(k => {
      const t = temas[k];
      if (!t || typeof t !== "object") return;
      if (k === "global") { if (t.activo === false) return; }
      else if (t.heredar === false) v = {};
      if (t.v && typeof t.v === "object") Object.keys(t.v).forEach(f => { v[f] = t.v[f]; });
    });
    return v;
  }

  // ---------- Generación del CSS ----------
  const S_CAJAS = ".card,.acordeon,.seccion-detalles,.reproductor-box,.hero,.ficha-poster";
  const S_RADIO = S_CAJAS + ",.partes-grid a,.cap-btn,.galeria-capturas img,.buscador,.info-lista li";
  const S_HOVER = ".card:hover,.partes-grid a:hover,.cap-btn:hover,.galeria-capturas img:hover";
  const ANCHOS = { compacto: ["900px", "720px"], ancho: ["1600px", "1200px"], completo: ["100%", "1400px"] };

  function generarCSS(v0) {
    const v = limpiar(v0);
    const L = [];
    const root = [];
    Object.keys(MAPA_VARS).forEach(k => { if (v[k]) root.push(MAPA_VARS[k] + ":" + v[k]); });
    const fT = FUENTES[v.fuenteTexto], fH = FUENTES[v.fuenteTitulos];
    if (fT && fT.css) root.push("--font-body:" + fT.css);
    if (fH && fH.css) root.push("--font-title:" + fH.css);
    if (root.length) L.push(":root{" + root.join(";") + "}");

    // Fondo y texto general
    const body = [];
    const bgc = "var(--bg,#0f0f0f)";
    const adj = v.fondoFijo === false ? "scroll" : "fixed";
    if (v.fondoTipo === "degradado") {
      body.push("background-color:" + bgc,
        "background-image:linear-gradient(" + (v.fondoAngulo != null ? v.fondoAngulo : 160) + "deg," + bgc + "," + (v.fondoColor2 || "#1a1a2e") + ")",
        "background-size:cover", "background-repeat:no-repeat", "background-attachment:" + adj);
    } else if (v.fondoTipo === "imagen" && v.fondoImagen) {
      const o = (v.fondoOscuridad != null ? v.fondoOscuridad : 50) / 100;
      body.push("background-color:" + bgc,
        "background-image:linear-gradient(rgba(0,0,0," + o + "),rgba(0,0,0," + o + ")),url(\"" + urlCss(v.fondoImagen) + "\")",
        "background-size:cover", "background-position:center", "background-repeat:no-repeat", "background-attachment:" + adj);
    } else if (v.fondo) {
      body.push("background:" + bgc);
    }
    if (v.texto) body.push("color:var(--text)");
    if (fT && fT.css) body.push("font-family:var(--font-body)");
    if (v.tamano != null && v.tamano !== 100) body.push("zoom:" + (v.tamano / 100));
    if (body.length) L.push("body{" + body.join(";") + "}");

    if (fH && fH.css) L.push("h1,h2,h3{font-family:var(--font-title)}");
    if (v.mayusc) L.push("h1,h2,h3{text-transform:uppercase}");

    // Tarjetas: estilo
    if (v.estiloTarjeta === "vidrio") {
      L.push(".card,.acordeon,.seccion-detalles,.reproductor-box{background:color-mix(in srgb,var(--card,#1b1b1b) 55%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}");
      L.push(".acordeon-header,.info-lista li,.cap-btn,.partes-grid a{background:color-mix(in srgb,var(--card2,#222) 55%,transparent)}");
    } else if (v.estiloTarjeta === "contorno") {
      L.push(".card,.acordeon,.seccion-detalles,.reproductor-box{background:transparent;border:1px solid var(--accent,#00bfff)}");
      L.push(".acordeon-header,.info-lista li{background:transparent}");
    }
    // Bordes y esquinas
    if (v.radio != null) L.push(S_RADIO + "{border-radius:" + v.radio + "px}");
    if (v.bordeGrosor != null) {
      const col = v.estiloTarjeta === "contorno" ? "var(--accent,#00bfff)" : "var(--line,#2a2a2a)";
      L.push(S_CAJAS + "{border-width:" + v.bordeGrosor + "px;border-style:" + (v.bordeGrosor ? "solid" : "none") + ";border-color:" + col + "}");
    }
    // Hover
    if (v.brillo != null) {
      L.push(S_HOVER + "{box-shadow:" + (v.brillo ? "0 0 " + v.brillo + "px var(--accent,#00bfff)" : "none") + "}");
    }
    if (v.animHover === false) {
      L.push(S_HOVER + "{transform:none !important}");
    }
    if (v.animEntrada) {
      L.push("@keyframes ms47In{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}");
      L.push("main,.categorias,.container{animation:ms47In .6s ease}");
    }

    // Estructura
    if (v.ancho && ANCHOS[v.ancho]) {
      const a = ANCHOS[v.ancho];
      L.push("main,.container,.categorias{max-width:" + a[0] + "}");
      L.push(".ficha-contenido{max-width:" + a[0] + "}");
      L.push(".contenido-central{max-width:" + a[1] + "}");
    }
    if (v.navVisible === false) {
      L.push(".navbar,header{display:none !important}");
      L.push("main{margin-top:24px !important}.container{padding-top:30px !important}");
    }
    if (v.navEstilo === "solido") {
      L.push(".navbar,header{background:var(--card,#111) !important;-webkit-backdrop-filter:none;backdrop-filter:none}");
    } else if (v.navEstilo === "transparente") {
      L.push(".navbar,header{background:transparent !important;box-shadow:none !important;border-color:transparent !important;-webkit-backdrop-filter:none;backdrop-filter:none}");
    } else if (v.navEstilo === "vidrio") {
      L.push(".navbar,header{background:color-mix(in srgb,var(--bg,#0a0a0b) 55%,transparent) !important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}");
    }

    // CSS propio (se inserta como texto de <style>; se sacan < y @import)
    if (v.cssExtra) L.push(v.cssExtra.replace(/</g, "").replace(/@import[^;]*;?/gi, ""));

    return L.join("\n");
  }

  function fuentesHref(v) {
    v = limpiar(v);
    const out = [];
    ["fuenteTexto", "fuenteTitulos"].forEach(k => {
      const f = FUENTES[v[k]];
      if (f && f.gf) {
        const h = "https://fonts.googleapis.com/css2?family=" + f.gf + "&display=swap";
        if (out.indexOf(h) < 0) out.push(h);
      }
    });
    return out;
  }

  function cargarFuentes(v) {
    fuentesHref(v).forEach(h => {
      if (document.querySelector('link[data-ms47-font="' + h + '"]')) return;
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = h; l.setAttribute("data-ms47-font", h);
      document.head.appendChild(l);
    });
  }

  // ---------- Aplicar en una página pública ----------
  const API = {
    FUENTES, GRUPOS, CAMPOS, PRESETS,
    niveles, resolver, limpiar, generarCSS, fuentesHref, urlOk,
    actual: {},

    // ---------- Imágenes livianas ----------
    // Devuelve la URL de una miniatura del ancho pedido:
    //  · Cloudinary: se le agrega el recorte/optimización en la propia URL.
    //  · Otras imágenes de internet: solo si en config.js pusiste IMG_PROXY: "weserv" (convierte a WebP chico).
    //  · Archivos del repositorio (ej: aventura.png): se usan tal cual (comprimilos antes de subirlos).
    thumb(url, w) {
      url = urlOk(url);
      if (!url) return "";
      w = Math.max(60, Math.min(1600, Math.round(w || 480)));
      try {
        if (/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//i.test(url) && !/\/upload\/(?:[^/]*,)?(?:w_|q_auto|f_auto)/i.test(url)) {
          return url.replace("/upload/", "/upload/w_" + w + ",c_limit,q_auto,f_auto/");
        }
        const px = window.MS47 && window.MS47.IMG_PROXY;
        if (px === "weserv" && /^https?:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.|192\.168\.)/i.test(url) && !/\.(gif|svg)(\?|#|$)/i.test(url)) {
          return "https://images.weserv.nl/?url=" + encodeURIComponent(url.replace(/^https?:\/\//i, "")) + "&w=" + w + "&we&q=75&output=webp";
        }
      } catch (e) {}
      return url;
    },
    // <img> listo: miniatura + carga diferida + decodificación en segundo plano.
    // Si la miniatura falla, vuelve sola a la imagen original.
    img(url, w, alt, extra) {
      const full = urlOk(url);
      if (!full) return '<img alt="" style="visibility:hidden">';
      const q = x => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const t = API.thumb(full, w);
      const fb = t !== full ? ' data-full="' + q(full) + '" onerror="this.onerror=null;this.src=this.dataset.full"' : "";
      return '<img src="' + q(t) + '"' + fb + ' alt="' + q(alt) + '" loading="lazy" decoding="async"' + (extra ? " " + extra : "") + ">";
    },

    aplicar(v) {
      v = limpiar(v);
      API.actual = v;
      let st = document.getElementById("ms47-estilo");
      if (!st) {
        st = document.createElement("style");
        st.id = "ms47-estilo";
        (document.head || document.documentElement).appendChild(st);
      }
      st.textContent = generarCSS(v);
      if (document.head) cargarFuentes(v);
      return v;
    },

    guardarCache(clave, v) {
      try { localStorage.setItem("ms47_tema_" + clave, JSON.stringify(v || {})); } catch (e) {}
    },
    // Se llama al principio del <head> para evitar el "parpadeo" del diseño viejo
    aplicarCache(clave) {
      try {
        const c = JSON.parse(localStorage.getItem("ms47_tema_" + clave));
        if (c && typeof c === "object") API.aplicar(c);
      } catch (e) {}
    },
    // temas = contenido de config/temas
    aplicarDesdeTemas(temas, clave, tipo) {
      const v = API.aplicar(resolver(temas, clave, tipo));
      API.guardarCache(clave, v);
      return v;
    }
  };

  window.MS47_ESTILO = API;
})();
