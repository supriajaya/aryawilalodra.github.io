const db = firebase.database();
const userCache = {};

function initializeHome() {
  console.log('Halaman Beranda berhasil dimuat dan diinisialisasi.');
  initializeUserProfile();
  setupSearchFunctionality();
  setupChatNotifications();
  loadPosts();
  initializeDigitalStore();
  
  document.addEventListener('click', function(event) {
    const kwitansi = document.getElementById('kwitansi');
    const isClickInsideKwitansi = kwitansi?.contains(event.target);
    const isKwitansiVisible = window.getComputedStyle(kwitansi).display !== 'none';
    if (isKwitansiVisible && !isClickInsideKwitansi) {
      kwitansi.style.display = 'none';
    }
  });

  const kwitansi = document.getElementById('kwitansi');
  if (kwitansi) {
    kwitansi.addEventListener('click', function() {
      this.style.display = 'none';
    });
  }

  const modalGambar = document.getElementById("modalGambar");
  if (modalGambar) {
    modalGambar.addEventListener("click", () => {  
      modalGambar.style.display = "none";
    });
  }

  window.kirimKomentar = kirimKomentar;
  window.toggleLike = toggleLike;
  window.tampilkanGambarPenuh = tampilkanGambarPenuh;
  window.pilihProduk = pilihProduk;
  window.closeStruk = closeStruk;
  window.submitDigital = submitDigital;
  window.showQris = showQris;
  window.closeQris = closeQris;
}

function initializeUserProfile() { /*... kode Anda yang sudah ada ...*/ }
function updateProfileDisplay(nama, foto, userID) { /*... kode Anda yang sudah ada ...*/ }
function fetchUserProfileFromDB(userID) { /*... kode Anda yang sudah ada ...*/ }
function setupSearchFunctionality() { /*... kode Anda yang sudah ada ...*/ }
function setupChatNotifications() { /*... kode Anda yang sudah ada ...*/ }
function showChatSendersList(userID) { /*... kode Anda yang sudah ada ...*/ }
function loadPosts() { /*... kode Anda yang sudah ada ...*/ }
function getUserData(uid) { /*... kode Anda yang sudah ada ...*/ }
function createPostHTML(namaPemilik, post, postId) { /*... kode Anda yang sudah ada ...*/ }
function setupPostInteractions(postId) { /*... kode Anda yang sudah ada ...*/ }
function kirimKomentar(postId) { /*... kode Anda yang sudah ada ...*/ }
function toggleLike(postId) { /*... kode Anda yang sudah ada ...*/ }
function tampilkanGambarPenuh(src) { /*... kode Anda yang sudah ada ...*/ }
function initializeDigitalStore() { /*... kode Anda yang sudah ada ...*/ }
function formatRupiah(angka) { /*... kode Anda yang sudah ada ...*/ }

window.pageInitializers['home'] = initializeHome;
