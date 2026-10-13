/* ============================================================
   CONFIG COMPARTIDA - MS47
   Es el único lugar donde viven las claves del sitio.
   (Script clásico: funciona igual abriendo el HTML con doble clic
   o desde GitHub Pages.)
   ============================================================ */
window.MS47 = {

  // Firebase (Realtime Database + Authentication)
  firebaseConfig: {
    apiKey: "AIzaSyAaofk2PwrBCDAgkawSH9VTOpfE9dRNvAY",
    authDomain: "ms47admin.firebaseapp.com",
    projectId: "ms47admin",
    storageBucket: "ms47admin.firebasestorage.app",
    messagingSenderId: "1006110737647",
    appId: "1:1006110737647:web:3aa0c5fa55b7838252471a",
    databaseURL: "https://ms47admin-default-rtdb.firebaseio.com"
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
