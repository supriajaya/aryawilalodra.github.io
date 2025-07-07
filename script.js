// Konfigurasi URL Google Apps Script Web App Anda
// PASTIKAN URL INI BENAR SESUAI DENGAN DEPLOYMENT TERBARU ANDA
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyN2d6hEb_MR2fqXKFZXVoWZNtaqA5trsMvLEwt5X0Zor9GoQKAaA7Ufo2rahMtneftqQ/exec';

// Variabel global untuk menyimpan data pelanggan yang sedang login (jika ada)
let currentCustomer = null;
// Objek produk dummy (bisa diambil dari Google Sheet nanti)
const products = [
    { id: 'prod001', name: 'Nasi Goreng Spesial', price: 25000, image: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=NasiGoreng' },
    { id: 'prod002', name: 'Mie Ayam Bakso', price: 20000, image: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=MieAyam' },
    { id: 'prod003', name: 'Es Teh Manis', price: 5000, image: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=EsTeh' },
    { id: 'prod004', name: 'Ayam Geprek', price: 28000, image: 'https://via.placeholder.com/150/FF33FB/FFFFFF?text=AyamGeprek' },
    { id: 'prod005', name: 'Kopi Susu Gula Aren', price: 18000, image: 'https://via.placeholder.com/150/8A2BE2/FFFFFF?text=KopiSusu' },
    { id: 'prod006', name: 'Roti Bakar Keju Coklat', price: 15000, image: 'https://via.placeholder.com/150/FFD700/FFFFFF?text=RotiBakar' }
];
let cart = []; // Keranjang belanja

// --- Fungsi Utilitas UI ---
// Fungsi untuk menampilkan view tertentu dan menyembunyikan yang lain
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
}

// Fungsi untuk menampilkan custom alert modal
function showCustomAlert(message, type = 'info') {
    const alertOverlay = document.getElementById('custom-alert-overlay');
    const alertMessage = document.getElementById('custom-alert-message');
    alertMessage.textContent = message;
    alertMessage.className = ''; // Reset classes
    if (type === 'success') alertMessage.classList.add('success-text');
    if (type === 'error') alertMessage.classList.add('error-text');

    alertOverlay.classList.remove('hidden');
}

// Fungsi untuk menampilkan pesan di dalam formulir (misal: sukses/gagal pendaftaran)
function displayFormMessage(elementId, message, isSuccess) {
    const msgElement = document.getElementById(elementId);
    msgElement.textContent = message;
    msgElement.className = 'info-message'; // Reset classes
    if (isSuccess) {
        msgElement.classList.add('success');
    } else {
        msgElement.classList.add('error');
    }
    msgElement.style.display = 'block';
}

// Fungsi untuk menyembunyikan pesan di dalam formulir
function hideFormMessage(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

// Fungsi untuk memperbarui teks tombol profil berdasarkan status login
function updateProfileButton() {
    const profileButton = document.getElementById('profileButton');
    if (currentCustomer && currentCustomer.NamaLengkap) {
        profileButton.textContent = `Profil (${currentCustomer.NamaLengkap.split(' ')[0]})`;
    } else {
        profileButton.textContent = 'Profil Saya';
    }
}

// --- Event Listeners Global ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(); // Render daftar produk saat halaman dimuat
    updateCartDisplay(); // Perbarui tampilan keranjang
    updateProfileButton(); // Atur teks tombol profil
    // Coba load pelanggan dari sessionStorage jika ada (untuk menjaga sesi sederhana)
    const storedCustomer = sessionStorage.getItem('currentCustomer');
    if (storedCustomer) {
        currentCustomer = JSON.parse(storedCustomer);
        updateProfileButton();
    }
});

// Tutup Custom Alert
document.getElementById('custom-alert-ok-button').addEventListener('click', () => {
    document.getElementById('custom-alert-overlay').classList.add('hidden');
});

// --- Navigasi dan Modal Keranjang ---
document.getElementById('profileButton').addEventListener('click', () => {
    if (currentCustomer) {
        showView('profile-page-view');
        loadProfileData(currentCustomer); // Load data pelanggan ke form profil
    } else {
        showView('login-page-view');
        displayFormMessage('loginResponseMessage', 'Silakan masuk atau daftar untuk melihat profil Anda.', false);
    }
});

document.getElementById('cartButton').addEventListener('click', () => {
    document.getElementById('cartOverlay').classList.add('active');
});

document.getElementById('closeCartModal').addEventListener('click', () => {
    document.getElementById('cartOverlay').classList.remove('active');
});

document.getElementById('close-profile-button').addEventListener('click', () => {
    showView('mainContentView');
});

document.getElementById('openDepositFormBtn').addEventListener('click', () => {
    showView('deposit-page-view');
    if (currentCustomer) {
        document.getElementById('deposit_nama').value = currentCustomer.NamaLengkap || '';
        document.getElementById('deposit_handphone').value = currentCustomer.NomorHP || '';
    }
});

document.getElementById('close-deposit-button').addEventListener('click', () => {
    showView('profile-page-view'); // Kembali ke profil setelah menutup deposit
});

document.getElementById('close-register-button').addEventListener('click', () => {
    showView('mainContentView');
});

document.getElementById('close-login-button').addEventListener('click', () => {
    showView('mainContentView');
});

document.getElementById('openRegisterFromLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showView('register-page-view');
    hideFormMessage('loginResponseMessage');
});

document.getElementById('openLoginFromRegister').addEventListener('click', (e) => {
    e.preventDefault();
    showView('login-page-view');
    hideFormMessage('registerResponseMessage');
});

// --- Fungsionalitas Login/Register ---
document.getElementById('submitLoginBtn').addEventListener('click', async () => {
    const handphone = document.getElementById('login_handphone').value.trim();
    if (!handphone) {
        displayFormMessage('loginResponseMessage', 'Nomor Handphone harus diisi.', false);
        return;
    }

    displayFormMessage('loginResponseMessage', 'Mencari akun...', false);

    const formData = new FormData();
    formData.append('action', 'getCustomerByHandphone');
    formData.append('nomorHp', handphone);

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success && data.customer) {
            currentCustomer = data.customer; // Simpan data pelanggan yang login
            sessionStorage.setItem('currentCustomer', JSON.stringify(currentCustomer)); // Simpan di sessionStorage
            displayFormMessage('loginResponseMessage', 'Login berhasil! Selamat datang, ' + currentCustomer.NamaLengkap + '!', true);
            setTimeout(() => {
                showView('mainContentView'); // Kembali ke halaman utama
                updateProfileButton(); // Update teks tombol profil
            }, 1500);
        } else {
            currentCustomer = null; // Pastikan tidak ada pelanggan yang login
            sessionStorage.removeItem('currentCustomer');
            displayFormMessage('loginResponseMessage', 'Nomor HP tidak terdaftar. Silakan daftar.', false);
        }
    } catch (error) {
        displayFormMessage('loginResponseMessage', 'Terjadi kesalahan saat login: ' + error.message, false);
        console.error('Error login:', error);
    }
});

document.getElementById('submitRegisterBtn').addEventListener('click', async () => {
    const regNama = document.getElementById('reg_nama').value.trim();
    const regHandphone = document.getElementById('reg_handphone').value.trim();
    const regEmail = document.getElementById('reg_email').value.trim();
    const regSosmed = document.getElementById('reg_sosmed').value.trim();
    const regAlamat = document.getElementById('reg_alamat').value.trim();

    if (!regNama || !regHandphone) {
        displayFormMessage('registerResponseMessage', 'Nama Lengkap dan Nomor Handphone harus diisi.', false);
        return;
    }

    displayFormMessage('registerResponseMessage', 'Mendaftarkan akun...', false);

    const formData = new FormData();
    formData.append('action', 'addCustomer');
    formData.append('namaLengkap', regNama);
    formData.append('nomorHp', regHandphone);
    formData.append('email', regEmail);
    formData.append('sosmed', regSosmed);
    formData.append('alamatLengkap', regAlamat);
    formData.append('saldo', '0'); // Saldo awal 0
    formData.append('tanggalDaftar', new Date().toLocaleDateString('id-ID')); // Tanggal daftar otomatis
    formData.append('customersId', 'CUST-' + new Date().getTime()); // ID Pelanggan unik

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            displayFormMessage('registerResponseMessage', 'Pendaftaran berhasil! Silakan masuk.', true);
            // Kosongkan form
            document.getElementById('reg_nama').value = '';
            document.getElementById('reg_handphone').value = '';
            document.getElementById('reg_email').value = '';
            document.getElementById('reg_sosmed').value = '';
            document.getElementById('reg_alamat').value = '';
            setTimeout(() => {
                showView('login-page-view'); // Arahkan ke halaman login
                displayFormMessage('loginResponseMessage', 'Akun Anda berhasil didaftarkan. Silakan masuk.', true);
            }, 1500);

        } else {
            displayFormMessage('registerResponseMessage', 'Pendaftaran gagal: ' + data.message, false);
        }
    } catch (error) {
        displayFormMessage('registerResponseMessage', 'Terjadi kesalahan saat mendaftar: ' + error.message, false);
        console.error('Error register:', error);
    }
});

// --- Fungsionalitas Profil ---
function loadProfileData(customer) {
    document.getElementById('customerName').value = customer.NamaLengkap || '';
    document.getElementById('customerHandphone').value = customer.NomorHP || '';
    document.getElementById('customerEmail').value = customer.Email || '';
    document.getElementById('customerSosmed').value = customer.Sosmed || '';
    document.getElementById('customerAddress').value = customer.AlamatLengkap || '';
    document.getElementById('customerBalanceDisplay').textContent = (customer.Saldo || 0).toLocaleString('id-ID'); // Format saldo
    hideFormMessage('profileResponseMessage');
}

document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    if (!currentCustomer) {
        showCustomAlert('Anda harus login untuk menyimpan profil.', 'error');
        return;
    }

    displayFormMessage('profileResponseMessage', 'Menyimpan perubahan...', false);

    const updatedData = {
        nomorHp: currentCustomer.NomorHP, // Nomor HP sebagai kunci unik untuk update
        namaLengkap: document.getElementById('customerName').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        sosmed: document.getElementById('customerSosmed').value.trim(),
        alamatLengkap: document.getElementById('customerAddress').value.trim(),
    };

    const formData = new FormData();
    formData.append('action', 'updateCustomer');
    for (const key in updatedData) {
        formData.append(key, updatedData[key]);
    }

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            // Update currentCustomer lokal setelah berhasil di-GAS
            currentCustomer.NamaLengkap = updatedData.namaLengkap;
            currentCustomer.Email = updatedData.email;
            currentCustomer.Sosmed = updatedData.sosmed;
            currentCustomer.AlamatLengkap = updatedData.alamatLengkap;
            sessionStorage.setItem('currentCustomer', JSON.stringify(currentCustomer)); // Update di sessionStorage
            displayFormMessage('profileResponseMessage', 'Profil berhasil diperbarui!', true);
            updateProfileButton(); // Perbarui teks tombol profil jika nama berubah
        } else {
            displayFormMessage('profileResponseMessage', 'Gagal memperbarui profil: ' + data.message, false);
        }
    } catch (error) {
        displayFormMessage('profileResponseMessage', 'Terjadi kesalahan saat menyimpan profil: ' + error.message, false);
        console.error('Error saving profile:', error);
    }
});

// --- Fungsionalitas Deposit ---
document.getElementById('submitDepositBtn').addEventListener('click', async () => {
    const depositNama = document.getElementById('deposit_nama').value.trim();
    const depositHandphone = document.getElementById('deposit_handphone').value.trim();
    const depositAmount = document.getElementById('deposit_amount').value.trim();
    const depositMethod = document.getElementById('deposit_method').value;
    const depositProofFile = document.getElementById('deposit_proof').files[0];

    if (!depositNama || !depositHandphone || !depositAmount || !depositMethod) {
        displayFormMessage('depositResponseMessage', 'Harap isi semua kolom wajib.', false);
        return;
    }
    if (parseInt(depositAmount) < 1) {
        displayFormMessage('depositResponseMessage', 'Jumlah deposit minimal Rp 1.', false);
        return;
    }

    displayFormMessage('depositResponseMessage', 'Mengirim konfirmasi deposit...', false);

    const formData = new FormData();
    formData.append('action', 'addDeposit');
    formData.append('tanggal', new Date().toLocaleDateString('id-ID'));
    formData.append('namaPelanggan', depositNama);
    formData.append('nomorHp', depositHandphone);
    formData.append('jumlahDeposit', depositAmount);
    formData.append('metodePembayaran', depositMethod);
    formData.append('status', 'Pending'); // Status awal deposit

    if (depositProofFile) {
        formData.append('fileBlob', depositProofFile);
        formData.append('fileName', depositProofFile.name);
        formData.append('contentType', depositProofFile.type); // Tambahkan ini!
    }

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            displayFormMessage('depositResponseMessage', 'Konfirmasi deposit berhasil dikirim! Silakan tunggu verifikasi.', true);
            // Kosongkan form setelah sukses
            document.getElementById('deposit_amount').value = '';
            document.getElementById('deposit_method').value = '';
            document.getElementById('deposit_proof').value = '';
            // Anda mungkin ingin memperbarui saldo pelanggan di UI setelah deposit diverifikasi di backend
        } else {
            displayFormMessage('depositResponseMessage', 'Gagal mengirim konfirmasi deposit: ' + data.message, false);
        }
    } catch (error) {
        displayFormMessage('depositResponseMessage', 'Terjadi kesalahan saat mengirim deposit: ' + error.message, false);
        console.error('Error deposit:', error);
    }
});

// --- Fungsionalitas Produk & Keranjang ---
function renderProducts() {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Bersihkan daftar produk
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Rp ${product.price.toLocaleString('id-ID')}</p>
            <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
        `;
        productList.appendChild(productCard);
    });

    // Tambahkan event listener ke setiap tombol "Tambah ke Keranjang"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartDisplay();
        showCustomAlert(`${product.name} ditambahkan ke keranjang!`, 'success');
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const cartCountSpan = document.getElementById('cartCount');
    const checkoutButton = document.getElementById('checkoutButton');

    cartItemsContainer.innerHTML = ''; // Bersihkan item keranjang
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                <button class="remove-from-cart-btn" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
            total += item.price * item.quantity;
            itemCount += item.quantity;
        });
    }

    cartTotalSpan.textContent = total.toLocaleString('id-ID');
    cartCountSpan.textContent = itemCount;
    checkoutButton.disabled = cart.length === 0; // Nonaktifkan tombol checkout jika keranjang kosong

    // Tambahkan event listener ke tombol hapus item keranjang
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        });
    });
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCartDisplay();
    }
}


// --- Fungsionalitas Checkout ---
document.getElementById('checkoutButton').addEventListener('click', async () => {
    if (cart.length === 0) {
        showCustomAlert('Keranjang Anda kosong.', 'error');
        return;
    }

    if (!currentCustomer) {
        showCustomAlert('Anda harus login untuk melakukan checkout.', 'error');
        // Arahkan ke halaman login setelah beberapa saat
        setTimeout(() => {
            showView('login-page-view');
            document.getElementById('cartOverlay').classList.remove('active'); // Tutup keranjang
        }, 1000);
        return;
    }

    // Siapkan data pesanan untuk dikirim ke Google Apps Script
    const totalPembelian = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const detailPesanan = cart.map(item => `${item.name} (x${item.quantity} @Rp ${item.price.toLocaleString('id-ID')})`).join('; ');

    const formData = new FormData();
    formData.append('action', 'addOrder');
    formData.append('tanggal', new Date().toLocaleDateString('id-ID'));
    formData.append('nomorHpPelanggan', currentCustomer.NomorHP); // Gunakan nomor HP pelanggan yang login
    formData.append('totalPembelian', totalPembelian);
    formData.append('detailPesanan', detailPesanan);
    formData.append('metodePembayaran', 'Menunggu Konfirmasi'); // Anda bisa tambahkan pilihan metode pembayaran di sini, misal: 'Saldo Deposit', 'COD', 'Bank Transfer'

    try {
        showCustomAlert('Memproses pesanan...', 'info');
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            showCustomAlert('Pesanan Anda berhasil dibuat! Terima kasih. Admin akan segera memproses.', 'success');
            cart = []; // Kosongkan keranjang
            updateCartDisplay();
            document.getElementById('cartOverlay').classList.remove('active'); // Tutup keranjang
            showView('mainContentView'); // Kembali ke halaman utama
        } else {
            showCustomAlert('Gagal membuat pesanan: ' + data.message, 'error');
        }
    } catch (error) {
        showCustomAlert('Terjadi kesalahan saat checkout: ' + error.message, 'error');
        console.error('Error checkout:', error);
    }
});

// --- Fungsionalitas Riwayat Pesanan ---
document.getElementById('viewOrderHistoryBtn').addEventListener('click', async () => {
    if (!currentCustomer) {
        showCustomAlert('Anda harus login untuk melihat riwayat pesanan.', 'error');
        return;
    }
    showView('order-history-view');
    await loadOrderHistory(currentCustomer.NomorHP);
});

document.getElementById('close-order-history-button').addEventListener('click', () => {
    showView('profile-page-view'); // Kembali ke halaman profil
});

async function loadOrderHistory(nomorHp) {
    const orderHistoryList = document.getElementById('orderHistoryList');
    orderHistoryList.innerHTML = '<p>Memuat riwayat pesanan...</p>'; // Tampilkan pesan loading

    const formData = new FormData();
    formData.append('action', 'getCustomerOrders');
    formData.append('nomorHpPelanggan', nomorHp);

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success && data.orders.length > 0) {
            orderHistoryList.innerHTML = ''; // Bersihkan pesan loading
            // Urutkan pesanan dari terbaru ke terlama berdasarkan tanggal
            data.orders.sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));

            data.orders.forEach(order => {
                const orderCard = document.createElement('div');
                orderCard.className = 'order-card';
                orderCard.innerHTML = `
                    <h4>Pesanan pada ${order.Tanggal}</h4>
                    <p>Total: Rp ${parseFloat(order.TotalPembelian).toLocaleString('id-ID')}</p>
                    <p>Detail: ${order.DetailPesanan}</p>
                    <p class="order-status">Status: <strong>${order.StatusPesanan || 'Menunggu Konfirmasi'}</strong></p>
                `;
                orderHistoryList.appendChild(orderCard);
            });
        } else {
            orderHistoryList.innerHTML = '<p>Belum ada riwayat pesanan.</p>';
        }
    } catch (error) {
        orderHistoryList.innerHTML = '<p class="error-text">Gagal memuat riwayat pesanan: ' + error.message + '</p>';
        console.error('Error loading order history:', error);
    }
}
