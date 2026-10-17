/* ============================================================
   CHEQUEADOR DE LINKS - MS47  (Cloudflare Worker, plan gratis)
   ------------------------------------------------------------
   Para qué sirve: el navegador no puede ver si un archivo de Mega,
   Drive o MediaFire fue borrado (lo impide la seguridad de los sitios).
   Este pequeño programa corre en un servidor de Cloudflare, mira el link
   por vos y le contesta al panel admin: ok / roto / dudoso.

   Instalación (5 minutos, gratis):
   1. Entrá a https://dash.cloudflare.com → Workers & Pages → Create → Create Worker.
   2. Ponele un nombre (ej: ms47-links), apretá Deploy y después «Edit code».
   3. Borrá todo lo que haya y pegá ESTE archivo completo. Apretá Deploy.
   4. Copiá la dirección que te da (ej: https://ms47-links.tuusuario.workers.dev).
   5. En config.js agregá, dentro de window.MS47 = { ... }, esta línea:
        LINK_CHECK_URL: "https://ms47-links.tuusuario.workers.dev",
   6. En ALLOWED_ORIGINS (abajo) poné la dirección de tu sitio, para que solo
      tu panel pueda usarlo.
   ============================================================ */

// Dónde está tu sitio (sin barra final). Ej: ["https://mastersensei47.github.io"]
// Si lo dejás vacío cualquiera podría usar tu chequeador.
const ALLOWED_ORIGINS = [];

const UA = "Mozilla/5.0 (compatible; MS47-LinkCheck/1.0)";

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const permitido = !ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": permitido ? (origin || "*") : "null",
      "Vary": "Origin",
      "Content-Type": "application/json; charset=utf-8"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: Object.assign({}, cors, { "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Max-Age": "86400" }) });
    }
    if (!permitido) return respuesta({ estado: "dudoso", detalle: "Origen no permitido" }, 403, cors);

    let url;
    try { url = new URL(new URL(request.url).searchParams.get("u") || ""); }
    catch (e) { return respuesta({ estado: "dudoso", detalle: "Link inválido" }, 400, cors); }
    if (!/^https?:$/.test(url.protocol) || hostBloqueado(url.hostname)) {
      return respuesta({ estado: "dudoso", detalle: "Link no permitido" }, 400, cors);
    }
    try {
      return respuesta(await revisar(url), 200, cors);
    } catch (e) {
      return respuesta({ estado: "dudoso", detalle: "No se pudo comprobar: " + String((e && e.message) || e).slice(0, 80) }, 200, cors);
    }
  }
};

function respuesta(obj, status, headers) { return new Response(JSON.stringify(obj), { status, headers }); }

function hostBloqueado(h) {
  h = h.toLowerCase();
  return h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h) || h.includes(":");
}

async function revisar(url) {
  const h = url.hostname.toLowerCase(), u = url.href;
  if (/(^|\.)mega\.(nz|io|co\.nz)$/.test(h)) { const r = await mega(u); if (r) return r; }
  if (h === "drive.google.com" || h === "docs.google.com") { const r = await drive(url); if (r) return r; }
  if (/(^|\.)mediafire\.com$/.test(h)) return mediafire(u);
  return generico(u);
}

// ---------- Mega: se consulta la API pública (el link entero viaja en el parámetro u, con la parte # incluida) ----------
async function mega(u) {
  const f = u.match(/mega\.(?:nz|io|co\.nz)\/(?:#!|file\/|embed\/#!|embed\/)([\w-]{8})/i);
  const d = u.match(/mega\.(?:nz|io|co\.nz)\/(?:#F!|folder\/)([\w-]{8})/i);
  if (!f && !d) return null;
  const r = await fetch("https://g.api.mega.co.nz/cs" + (d ? "?n=" + d[1] : ""), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(f ? [{ a: "g", p: f[1] }] : [{ a: "f", c: 1, r: 1 }])
  });
  const j = await r.json();
  const x = Array.isArray(j) ? j[0] : j;
  if (typeof x === "number") {
    if (x === -9) return { estado: "roto", detalle: "Mega: el archivo ya no existe" };
    if (x === -16) return { estado: "roto", detalle: "Mega: el archivo fue bloqueado/eliminado" };
    if (x === -8) return { estado: "roto", detalle: "Mega: el link venció" };
    if (x === -11) return { estado: "dudoso", detalle: "Mega: acceso restringido" };
    return { estado: "dudoso", detalle: "Mega respondió con el código " + x };
  }
  return { estado: "ok", detalle: "Mega: el archivo existe" };
}

// ---------- Google Drive ----------
async function drive(url) {
  const m = url.href.match(/\/(?:file\/d|folders)\/([\w-]+)/) || url.href.match(/[?&]id=([\w-]+)/);
  if (!m) return null;
  const esCarpeta = /\/folders\//.test(url.href);
  const r = await fetch(esCarpeta ? "https://drive.google.com/drive/folders/" + m[1] : "https://drive.google.com/file/d/" + m[1] + "/view",
    { redirect: "follow", headers: { "User-Agent": UA, "Accept-Language": "es,en;q=0.8" } });
  if (r.status === 404) return { estado: "roto", detalle: "Drive: el archivo no existe o fue eliminado" };
  if (/accounts\.google\.com/.test(r.url)) return { estado: "dudoso", detalle: "Drive: el archivo no es público (pide iniciar sesión)" };
  if (r.status >= 500) return { estado: "dudoso", detalle: "Drive respondió con error " + r.status };
  if (r.status === 200) return { estado: "ok", detalle: "Drive: el archivo existe" };
  return { estado: "dudoso", detalle: "Drive respondió " + r.status };
}

// ---------- MediaFire ----------
async function mediafire(u) {
  const r = await fetch(u, { redirect: "follow", headers: { "User-Agent": UA } });
  if (r.status === 404 || r.status === 410) return { estado: "roto", detalle: "MediaFire: el archivo no existe" };
  const t = (await r.text()).slice(0, 200000);
  if (/Invalid or Deleted File|The key you provided for file download was invalid|file you requested has been (?:deleted|removed)|dmca/i.test(t)) {
    return { estado: "roto", detalle: "MediaFire: el archivo fue eliminado" };
  }
  if (r.status >= 500) return { estado: "dudoso", detalle: "MediaFire respondió con error " + r.status };
  return r.status < 400 ? { estado: "ok", detalle: "MediaFire: el archivo parece existir" } : { estado: "dudoso", detalle: "MediaFire respondió " + r.status };
}

// ---------- Cualquier otro sitio: solo se ve el código de respuesta ----------
async function generico(u) {
  let r;
  try {
    r = await fetch(u, { method: "HEAD", redirect: "follow", headers: { "User-Agent": UA } });
    if ([400, 403, 405, 501].includes(r.status)) r = await fetch(u, { method: "GET", redirect: "follow", headers: { "User-Agent": UA, "Range": "bytes=0-0" } });
  } catch (e) {
    return { estado: "roto", detalle: "No se pudo conectar con el sitio" };
  }
  if (r.status === 404 || r.status === 410) return { estado: "roto", detalle: "El archivo no existe (" + r.status + ")" };
  if (r.status === 401 || r.status === 403) return { estado: "dudoso", detalle: "Acceso restringido (" + r.status + ")" };
  if (r.status >= 500) return { estado: "dudoso", detalle: "El sitio respondió con error " + r.status };
  if (r.status < 400) return { estado: "ok", detalle: "El sitio responde (" + r.status + ")" };
  return { estado: "dudoso", detalle: "Respondió " + r.status };
}
