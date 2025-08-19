const firebaseConfig = {
    apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
    authDomain: "nasuka-fc780.firebaseapp.com",
    databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasuka-fc780",
    messagingSenderId: "860641747257",
    appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
};

// Inisialisasi Firebase App
firebase.initializeApp(firebaseConfig);

// Mendapatkan referensi ke database
const db = firebase.database();
