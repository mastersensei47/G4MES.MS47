/* ============================================================
   VALORES INICIALES - MS47
   Sirven para dos cosas:
   1) Si la base de datos todavía está vacía, el sitio se ve igual
      que antes (nunca queda en blanco).
   2) El botón "Cargar contenido inicial" del panel admin los
      copia a Firebase, y desde ahí se editan sin tocar código.
   ============================================================ */
(function () {

  const SOCIALES = {
    instagram: { nombre: "Instagram", icono: "fab fa-instagram" },
    tiktok:    { nombre: "TikTok",    icono: "fab fa-tiktok" },
    youtube:   { nombre: "YouTube",   icono: "fab fa-youtube" },
    facebook:  { nombre: "Facebook",  icono: "fab fa-facebook" },
    x:         { nombre: "X / Twitter", icono: "fab fa-x-twitter" },
    discord:   { nombre: "Discord",   icono: "fab fa-discord" },
    telegram:  { nombre: "Telegram",  icono: "fab fa-telegram" },
    whatsapp:  { nombre: "WhatsApp",  icono: "fab fa-whatsapp" },
    twitch:    { nombre: "Twitch",    icono: "fab fa-twitch" },
    web:       { nombre: "Otro link", icono: "fas fa-link" }
  };

  const DEFAULT_CONFIG = {
    sitioNombre: "mastersensei47",
    bannerImagen: "ms47.jpg",
    colorAcento: "#ff2e2e",
    aviso: "",
    footer: "© 2026 mastersensei47 - Todos los derechos reservados",
    redes: [
      { tipo: "instagram", url: "https://www.instagram.com/master__sensei47" },
      { tipo: "tiktok",    url: "https://www.tiktok.com/@mastersensei47" },
      { tipo: "youtube",   url: "https://www.youtube.com/@master-sensei47" }
    ]
  };

  // Si la config ya fue inicializada desde el admin, NO se mezclan los
  // valores por defecto (así se puede dejar el footer o las redes vacías).
  function mezclarConfig(cfg) {
    cfg = cfg || {};
    if (cfg.inicializado) {
      return Object.assign(
        { sitioNombre: "", bannerImagen: "", colorAcento: "#ff2e2e", aviso: "", footer: "", redes: [] },
        cfg
      );
    }
    return Object.assign({}, DEFAULT_CONFIG, cfg);
  }

  const cat = (nombre, icono, imagen, orden, playlists, extra) =>
    Object.assign({
      nombre, icono, imagen, orden, visible: true,
      playlists: playlists || [], items: [], enlace: ""
    }, extra || {});

  const DEFAULT_CATEGORIAS = {
    "minecraft":          cat("Minecraft & Versiones", "🟩", "minecraft.jpg",   10,  ["PLmrN7pAkmKvmBrJ2DSHvIOHcRdIQ8sNXK"]),
    "deportes":           cat("Deportes",              "🟦", "deportes.jpg",    20,  ["PLmrN7pAkmKvmXQPdtxMr5wO37TG5UrkQE"]),
    "aventura":           cat("Aventura",              "🟨", "aventura.png",    30,  ["PLmrN7pAkmKvkvMZ00RXSXV_llDSWti34Q"]),
    "simuladores":        cat("Simuladores",           "🖥️", "simuladores.png", 40,  ["PLmrN7pAkmKvkyc89AGtsjFjFIoHgo7un4"]),
    "online":             cat("Juegos Online",         "🌐", "online.jpg",      50,  ["PLmrN7pAkmKvl1o6kvbHrEufkCd5fkn5iS"]),
    "programas":          cat("Programas & Utilidades","💻", "programas.png",   60,  ["PLmrN7pAkmKvmhCyxCLbQxRrSypnKJRJV0"]),
    "mundo-abierto":      cat("Mundo Abierto",         "🌍", "mundo abierto.png", 70, ["PLmrN7pAkmKvmwQ2XICU-oji-Hv5fe88AP"]),
    "terror":             cat("Terror",                "🟥", "r.png",           80,  ["PLmrN7pAkmKvndfsZBHFyTzN0yZ9oXiQR6"],
                              { items: [{ tipo: "juego", slug: "fnaf-security-breach" }] }),
    "dinosaurios":        cat("Dinosaurios",           "🦖", "dinosaurios.png", 90,  ["PLmrN7pAkmKvmVw6DNR1Lkc7_pZlP9VqmP"]),
    "carreras":           cat("Carreras",              "🟧", "carreras.png",    100, ["PLmrN7pAkmKvkIJnzO4ojYwme-lvKHsZxv"]),
    "retro":              cat("Retro",                 "🟪", "retro.jpg",       110, ["PLmrN7pAkmKvm53gCXU-aQH68SCewWZotz"]),
    "pelea":              cat("Pelea",                 "🥊", "pelea.png",       120, ["PLmrN7pAkmKvmE8v05R5dYMFNgRNymab3k"]),
    "cooperativo":        cat("Coop local",            "🤝", "coop.png",        130, ["PLmrN7pAkmKvnhmTTpFeOybM1C6KID4CPB"]),
    "peliculas-y-series": cat("Películas y series",    "🍿", "peli.jpg",        140, ["PLmrN7pAkmKvn-FdzOyG5zDEdnhozMzURH"]),
    "tv-y-fulvo":         cat("TV y fútbol",           "📺", "tf.jpg",          150, [], { enlace: "tv y fulvo.html" })
  };

  // Página que antes era un HTML a mano (fnaf-security-breach.html),
  // ahora es un juego más dentro de juego.html?slug=fnaf-security-breach
  const FNAF_JUEGO = {
    titulo: "Five Nights at Freddy’s: Security Breach",
    grupo: "Terror",
    portada: "captura 1.jpg",
    fondo: "",
    fondoVideo: "",
    fondoModo: "hover",
    videoIzq: "https://www.youtube.com/watch?v=iI8xvJYKsnM", imagenIzq: "", modoIzq: "video",
    videoCentro: "https://www.youtube.com/watch?v=zYhwFb_Xjcs", imagenCentro: "", modoCentro: "video",
    videoDer: "https://www.youtube.com/watch?v=wmozuemP_-I", imagenDer: "", modoDer: "video",
    pesoTitulo: "DESCOMPRIMIDO (90 GB) solo la part1 tiene acortador",
    descargas: [
      { label: "Parte 1", url: "https://cuty.io/Fnf47" },
      { label: "Parte 2", url: "https://www.mediafire.com/file/l3veh7dxfffrg4k/FNaFSB.7z.002/file" },
      { label: "Parte 3", url: "https://www.mediafire.com/file/ahxqoqfynpb8zmr/FNaFSB.7z.003/file" },
      { label: "Parte 4", url: "https://www.mediafire.com/file/xt06egd850zeet5/FNaFSB.7z.004/file" },
      { label: "Parte 5", url: "https://www.mediafire.com/file/knoiywdq90j7eld/FNaFSB.7z.005/file" },
      { label: "Parte 6", url: "https://www.mediafire.com/file/5yennfflnsw1udi/FNaFSB.7z.006/file" },
      { label: "Parte 7", url: "https://www.mediafire.com/file/d3x8plgwagyde4l/FNaFSB.7z.007/file" }
    ],
    verificacion: "https://drive.google.com/file/d/1Z6nyo65DBNhGvtfszrz-x43wDOpsKdrg/preview",
    contenido: [
      "🎮 PERSONAJES / ENEMIGOS",
      "🤖 Glamrock Freddy",
      "🤖 Glamrock Chica",
      "🤖 Roxanne Wolf",
      "🤖 Montgomery Gator",
      "👤 Gregory",
      "👤 Vanessa (Security Guard)",
      "🎁 DLCs",
      "📦 Five Nights at Freddy’s: Security Breach – RUIN"
    ],
    requisitos: [
      "💻 Sistema operativo: Windows 10 (64 BITS)",
      "⚙️ Procesador: AMD Ryzen 5 3600 / Intel Core i5-6600K",
      "🧠 Memoria RAM: 8 GB",
      "🎮 Gráficos: NVIDIA GeForce GTX 1050 Ti",
      "💾 Almacenamiento: 80 GB disponibles"
    ],
    infoJuego: [
      "📌 Género: Acción, Aventura, Terror",
      "🖥️ Plataforma: PC",
      "📦 Edición: Build 11904663 | Full Version",
      "💽 Tamaño: 56.7 GB",
      "📅 Lanzamiento: 2021"
    ],
    galeria: ["captura 1.jpg", "captura 2.jpg", "captura 3.jpg"]
  };

  window.MS47_DEFAULTS = { SOCIALES, DEFAULT_CONFIG, DEFAULT_CATEGORIAS, FNAF_JUEGO, mezclarConfig };
})();
