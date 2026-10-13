/* ============================================================
   CONFIG COMPARTIDA - MS47
   Es el único lugar donde viven las claves del sitio.
   (Script clásico: funciona igual abriendo el HTML con doble clic
   o desde GitHub Pages.)
   ============================================================ */
window.MS47 = {

  // Firebase (Realtime Database + Authentication)
  firebaseConfig: {
    apiKey: "AIzaSyBjQB3yJdJPc44qvmge-H_961QJ1s_kh7E",
    authDomain: "tv-fulvo.firebaseapp.com",
    projectId: "tv-fulvo",
    storageBucket: "tv-fulvo.firebasestorage.app",
    messagingSenderId: "733955226142",
    appId: "1:733955226142:web:d49871efff59452b604c0f",
    databaseURL: "https://tv-fulvo-default-rtdb.firebaseio.com"
  },

  // API key de YouTube Data API (para las playlists de las categorías).
  // IMPORTANTE: restringila por dominio en Google Cloud (ver LEEME.md).
  YT_API_KEY: "AIzaSyCN5aFqwNDIvgDx30F98gc3Hqvw9_tLq4g",

  // OPCIONAL: subir imágenes desde el panel admin con Cloudinary.
  // Si dejás los dos campos vacíos, el botón "Subir imagen" no aparece
  // y las imágenes se cargan pegando una URL como siempre.
  CLOUDINARY: {
    cloudName: "",
    uploadPreset: ""   // preset de tipo "Unsigned"
  }
};
