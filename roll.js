const db = firebase.database();
const localUser = {
  Username: localStorage.getItem("Username"),
  Nama: localStorage.getItem("Nama"),
  Perak: parseInt(localStorage.getItem("Perak")) || 0,
  TotalLoss: parseInt(localStorage.getItem("TotalLoss")) || 0,
  operatorCapital: 1000
};

if (!localUser.Username) {
  console.log("Username tidak ditemukan di localStorage. Silakan login.");
}

const userRef = db.ref(`users/${localUser.Username}`);
const operatorCapitalRef = db.ref(`users/${localUser.Username}/operatorCapital`);

function initializeRoll() {
  console.log('Halaman Roll berhasil dimuat dan diinisialisasi.');

  userRef.on('value', (snapshot) => {
    const userData = snapshot.val();
    if (userData !== null) {
      localUser.Perak = userData.Perak || 0;
      localUser.TotalLoss = userData.TotalLoss || 0;
      localStorage.setItem("Perak", localUser.Perak);
      localStorage.setItem("TotalLoss", localUser.TotalLoss);
      updatePerakDisplay();
      console.log("Saldo dan total kekalahan berhasil disinkronkan.");
    }
  });

  operatorCapitalRef.on('value', (snapshot) => {
    const capitalData = snapshot.val();
    if (capitalData !== null) {
      localUser.operatorCapital = capitalData;
    } else {
      localUser.operatorCapital = 1000;
      operatorCapitalRef.set(1000); 
      console.log("Modal operator baru diinisialisasi.");
    }
    updateOperatorCapitalDisplay();
  });
  
  // Semua konstanta dan fungsi dari roll.html
  const ROLL_PER_REEL = 10;
  const REEL_RADIUS = 400;
  const SPIN_DURATION = 5;
  const MANUAL_SPIN_COOLDOWN = 4 * 400;
  const WIN_MULTIPLIERS = { 'dua': 2, 'tiga': 2.5, 'empat': 2.75, 'lima': 3, 'jackpot': 5 };
  const WIN_PROBABILITIES = { 'dua': 0.9, 'tiga': 0.7, 'empat': 0.5, 'lima': 0.000000000000000000000000000000001, 'jackpot': 0.0000000000000000000000000000000001 };
  const MIN_OPERATOR_CAPITAL = 100;
  let isSpinning = false;
  let lastManualSpinTime = 0;
  let currentmain = 0;
  let hasPlacedmain = false;
  let automainAmount = 0;
  let isAutomainEnabled = false;
  let playerWinStreak = 0;
  let playerLoseStreak = 0;
  const HOUSE_EDGE = 0;
  
  function updatePerakDisplay() { /* ... kode Anda ... */ }
  function updateOperatorCapitalDisplay() { /* ... kode Anda ... */ }
  function showErrorMessage(message) { /* ... kode Anda ... */ }
  function createROLL(ring) { /* ... kode Anda ... */ }
  function saveRollToDatabase(result, isManual = false) { /* ... kode Anda ... */ }
  function generateDua() { /* ... kode Anda ... */ }
  function generateTiga() { /* ... kode Anda ... */ }
  function generateEmpat() { /* ... kode Anda ... */ }
  function generateLima() { /* ... kode Anda ... */ }
  function generateJackpot() { /* ... kode Anda ... */ }
  function generateRandomResult() { /* ... kode Anda ... */ }
  function shuffleArray(array) { /* ... kode Anda ... */ }
  function generateControlledResult() { /* ... kode Anda ... */ }
  function adjustWinProbability(baseProbability) { /* ... kode Anda ... */ }
  function checkWin(result) { /* ... kode Anda ... */ }
  function toggleAutomain(amount) { /* ... kode Anda ... */ }
  function placemain(amount) { /* ... kode Anda ... */ }
  function cancelmain() { /* ... kode Anda ... */ }
  function processmainResult(result) { /* ... kode Anda ... */ }
  function saveWinToDatabase(amount, winType, numbers, mainAmount) { /* ... kode Anda ... */ }
  function spin(isManual = false) { /* ... kode Anda ... */ }
  function updateManualSpinButton() { /* ... kode Anda ... */ }
  function triggerConfetti() { /* ... kode Anda ... */ }

  $(document).ready(function() {
    for (let i = 1; i <= 5; i++) createROLL($('#ring' + i));
    $('#rotate').addClass('tilted');
    $('.roll').addClass('backface-on');
    setTimeout(() => $('#loading').fadeOut(), 2000);
    let winAudio = document.getElementById('winAudio');
    let userInteracted = false;
    
    $('#spinButton').click(function() {
      if (!userInteracted) {
        winAudio.muted = true;
        winAudio.play().then(() => {
          winAudio.pause();
          winAudio.currentTime = 0;
          winAudio.muted = false;
          userInteracted = true;
        }).catch(error => console.error("Audio play blocked:", error));
      }
      if (!$(this).prop('disabled')) {
        spin(true);
      }
    });

    $('#placemainButton').click(function() {
      const mainAmount = parseInt($('#mainAmount').val());
      if (isNaN(mainAmount) || mainAmount <= 0) {
        showErrorMessage('Masukkan jumlah pasangan yang valid');
        return;
      }
      placemain(mainAmount);
    });
    
    $('#cancelmainButton').click(function() {
      cancelmain();
    });
  });
}

window.toggleAutomain = toggleAutomain;
window.spin = spin;
window.pageInitializers['roll'] = initializeRoll;
