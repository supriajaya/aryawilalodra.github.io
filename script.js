const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwVunnvJ3AuJG4V-dv7DoTG0pjSCH-vkoLGY1cJXZ8OwtuZ7AJMSZ3LX7UXsFJTE--92g/exec"; 

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let loggedInPhoneNumber = localStorage.getItem('loggedInPhoneNumber') || null;

const products = [
    { id: 1, name: "Nasi Ayam Bakar", price: 25000, image: "https://via.placeholder.com/150/FF5733/FFFFFF?text=Nasi+Ayam+Bakar" },
    { id: 2, name: "Mie Ayam Komplit", price: 20000, image: "https://via.placeholder.com/150/33FF57/FFFFFF?text=Mie+Ayam+Komplit" },
    { id: 3, name: "Es Teh Manis", price: 5000, image: "https://via.placeholder.com/150/5733FF/FFFFFF?text=Es+Teh+Manis" },
    { id: 4, name: "Kopi Susu", price: 12000, image: "https://via.placeholder.com/150/FFC300/FFFFFF?text=Kopi+Susu" }
];

const productList = document.getElementById('productList');
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartModal = document.getElementById('closeCartModal');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalDisplay = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const profileButton = document.getElementById('profileButton');

const mainContentView = document.getElementById('mainContentView');
const profilePageView = document.getElementById('profile-page-view');
const closeProfileButton = document.getElementById('close-profile-button');
const customerNameInput = document.getElementById('customerName');
const customerHandphoneInput = document.getElementById('customerHandphone');
const customerEmailInput = document.getElementById('customerEmail');
const customerSosmedInput = document.getElementById('customerSosmed');
const customerAddressInput = document.getElementById('customerAddress');
const customerBalanceDisplay = document.getElementById('customerBalanceDisplay');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const openDepositFormBtn = document.getElementById('openDepositFormBtn');
const loginRegisterInfo = document.getElementById('loginRegisterInfo');

const depositPageView = document.getElementById('deposit-page-view');
const closeDepositButton = document.getElementById('close-deposit-button');
const depositNamaInput = document.getElementById('deposit_nama');
const depositHandphoneInput = document.getElementById('deposit_handphone');
const depositAmountInput = document.getElementById('deposit_amount');
const depositMethodSelect = document.getElementById('deposit_method');
const depositProofInput = document.getElementById('deposit_proof');
const submitDepositBtn = document.getElementById('submitDepositBtn');

const registerPageView = document.getElementById('register-page-view');
const closeRegisterButton = document.getElementById('close-register-button');
const regNamaInput = document.getElementById('reg_nama');
const regHandphoneInput = document.getElementById('reg_handphone');
const regEmailInput = document.getElementById('reg_email');
const regSosmedInput = document.getElementById('reg_sosmed');
const regAlamatInput = document.getElementById('reg_alamat');
const submitRegisterBtn = document.getElementById('submitRegisterBtn');

const loginPageView = document.getElementById('login-page-view');
const closeLoginButton = document.getElementById('close-login-button');
const loginHandphoneInput = document.getElementById('login_handphone');
const submitLoginBtn = document.getElementById('submitLoginBtn');

const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkButton = document.getElementById('custom-alert-ok-button');

function showCustomAlert(message) {
    customAlertMessage.textContent = message;
    customAlertOverlay.classList.remove('hidden');
}

function hideCustomAlert() {
    customAlertOverlay.classList.add('hidden');
}

function renderProducts() {
    productList.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Rp ${product.price.toLocaleString('id-ID')}</p>
            <button class="btn btn-add-to-cart" data-id="${product.id}">Tambah ke Keranjang</button>
        `;
        productList.appendChild(productCard);
    });

    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
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
        saveCart();
        updateCartDisplay();
        showCustomAlert(`${product.name} ditambahkan ke keranjang!`);
    }
}

function updateCartDisplay() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
        checkoutButton.disabled = true;
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.name} (${item.quantity}x)</span>
                <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                <button class="btn-remove" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });
        checkoutButton.disabled = false;
    }
    cartTotalDisplay.textContent = total.toLocaleString('id-ID');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.remove('hidden');
    document.getElementById(viewId).classList.add('active');
}

async function getCustomerBalance(phoneNumber) {
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getCustomerBalance&phoneNumber=${phoneNumber}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching balance:', error);
        return { error: "Gagal mengambil saldo." };
    }
}

async function getCustomerProfile(phoneNumber) {
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getCustomerProfile&phoneNumber=${phoneNumber}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { success: false, message: "Gagal mengambil data profil." };
    }
}

async function checkPhoneNumberRegistered(phoneNumber) {
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=checkPhoneNumber&phoneNumber=${phoneNumber}`);
        const data = await response.json();
        return data.isRegistered;
    } catch (error) {
        console.error('Error checking phone number:', error);
        return false;
    }
}

async function processCheckout(phoneNumber, cartItems, totalAmount) {
    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=processCheckout&contents=${encodeURIComponent(JSON.stringify({ phoneNumber, cartItems, totalAmount }))}`
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error during checkout:', error);
        return { success: false, message: "Terjadi kesalahan saat checkout." };
    }
}

async function recordGuestCheckout(cartItems, totalAmount) {
    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recordGuestCheckout&contents=${encodeURIComponent(JSON.stringify({ cartItems, totalAmount }))}`
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error recording guest checkout:', error);
        return { success: false, message: "Terjadi kesalahan saat mencatat pesanan tamu." };
    }
}

async function registerCustomer(nama, handphone, email, sosmed, alamat) {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'registerCustomer');
        formData.append('nama', nama);
        formData.append('handphone', handphone);
        formData.append('email', email);
        formData.append('sosmed', sosmed);
        formData.append('alamat', alamat);

        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const textResponse = await response.text();
        try {
            const data = JSON.parse(textResponse);
            return data;
        } catch (jsonError) {
            return { success: false, message: textResponse || "Terjadi kesalahan yang tidak diketahui saat pendaftaran." };
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return { success: false, message: "Gagal terhubung ke server untuk pendaftaran." };
    }
}

async function updateCustomerProfile(phoneNumber, name, email, sosmed, address) {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'updateCustomerProfile');
        formData.append('phoneNumber', phoneNumber);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('sosmed', sosmed);
        formData.append('address', address);

        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: "Gagal terhubung ke server untuk update profil." };
    }
}

async function submitDeposit(nama, handphone, amount, method, proofFile) {
    const formData = new FormData();
    formData.append('action', 'doDeposit');
    formData.append('nama', nama);
    formData.append('handphone', handphone);
    formData.append('amount', amount);
    formData.append('method', method);

    if (proofFile) {
        const reader = new FileReader();
        reader.readAsDataURL(proofFile);
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                const base64data = reader.result.split(',')[1];
                formData.append('proof', base64data);
                formData.append('proofContentType', proofFile.type);
                formData.append('proofFileName', proofFile.name);

                try {
                    const response = await fetch(GAS_WEB_APP_URL, {
                        method: 'POST',
                        body: formData
                    });
                    const textResponse = await response.text();
                    resolve({ success: true, message: textResponse });
                } catch (error) {
                    console.error('Error submitting deposit with proof:', error);
                    reject({ success: false, message: "Gagal mengirim konfirmasi deposit dengan bukti." });
                }
            };
            reader.onerror = error => reject({ success: false, message: "Gagal membaca file bukti transfer." });
        });
    } else {
        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                body: formData
            });
            const textResponse = await response.text();
            return { success: true, message: textResponse };
        } catch (error) {
            console.error('Error submitting deposit without proof:', error);
            return { success: false, message: "Gagal mengirim konfirmasi deposit." };
        }
    }
}

cartButton.addEventListener('click', () => {
    cartOverlay.classList.add('active');
    updateCartDisplay();
});

closeCartModal.addEventListener('click', () => {
    cartOverlay.classList.remove('active');
});

cartItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove')) {
        const productId = parseInt(e.target.dataset.id);
        removeFromCart(productId);
    }
});

checkoutButton.addEventListener('click', async () => {
    if (cart.length === 0) {
        showCustomAlert("Keranjang belanja Anda kosong.");
        return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (loggedInPhoneNumber) {
        const confirmCheckout = confirm(`Total belanja Anda Rp ${totalAmount.toLocaleString('id-ID')}. Lanjutkan dengan saldo akun?`);
        if (confirmCheckout) {
            const result = await processCheckout(loggedInPhoneNumber, cart, totalAmount);
            if (result.success) {
                showCustomAlert(`Checkout berhasil! Saldo Anda sekarang Rp ${result.newBalance.toLocaleString('id-ID')}.`);
                clearCart();
                cartOverlay.classList.remove('active');
                if (profilePageView.classList.contains('active')) {
                    const profile = await getCustomerProfile(loggedInPhoneNumber);
                    if (profile.success) {
                        customerBalanceDisplay.textContent = profile.balance.toLocaleString('id-ID');
                    }
                }
            } else {
                showCustomAlert(`Checkout gagal: ${result.message}`);
            }
        }
    } else {
        const confirmGuest = confirm(`Anda belum masuk. Total belanja Anda Rp ${totalAmount.toLocaleString('id-ID')}. Lanjutkan sebagai tamu?`);
        if (confirmGuest) {
            const result = await recordGuestCheckout(cart, totalAmount);
            if (result.success) {
                showCustomAlert("Pesanan Anda sebagai tamu berhasil dicatat! Silakan menuju kasir untuk pembayaran.");
                clearCart();
                cartOverlay.classList.remove('active');
                window.location.href = 'pembayaran.html'; 
            } else {
                showCustomAlert(`Pencatatan pesanan tamu gagal: ${result.message}`);
            }
        } else {
            const confirmLoginRegister = confirm("Untuk menggunakan saldo, Anda perlu masuk atau mendaftar. Apakah Anda ingin masuk atau mendaftar sekarang?");
            if (confirmLoginRegister) {
                cartOverlay.classList.remove('active');
                showView('login-page-view');
            }
        }
    }
});

profileButton.addEventListener('click', async () => {
    showView('profile-page-view');
    if (loggedInPhoneNumber) {
        loginRegisterInfo.innerHTML = '';
        customerHandphoneInput.value = loggedInPhoneNumber;
        customerHandphoneInput.readOnly = true;

        const profile = await getCustomerProfile(loggedInPhoneNumber);
        if (profile.success) {
            customerNameInput.value = profile.name;
            customerEmailInput.value = profile.email;
            customerSosmedInput.value = profile.sosmed;
            customerAddressInput.value = profile.address;
            customerBalanceDisplay.textContent = profile.balance.toLocaleString('id-ID');
            saveProfileBtn.style.display = 'inline-block';
            openDepositFormBtn.style.display = 'inline-block';
        } else {
            showCustomAlert(profile.message || "Gagal memuat profil.");
            localStorage.removeItem('loggedInPhoneNumber');
            loggedInPhoneNumber = null;
            updateProfileViewForLoggedOut();
        }
    } else {
        updateProfileViewForLoggedOut();
    }
});

function updateProfileViewForLoggedOut() {
    customerNameInput.value = '';
    customerEmailInput.value = '';
    customerSosmedInput.value = '';
    customerAddressInput.value = '';
    customerHandphoneInput.value = '';
    customerHandphoneInput.readOnly = false;
    customerBalanceDisplay.textContent = '0';
    saveProfileBtn.style.display = 'none';
    openDepositFormBtn.style.display = 'none';
    loginRegisterInfo.innerHTML = `
        <p>Anda belum masuk. Silakan:</p>
        <button id="goToLoginBtn" class="btn btn-secondary">Masuk</button>
        <button id="goToRegisterBtn" class="btn btn-secondary">Daftar Akun Baru</button>
    `;
    document.getElementById('goToLoginBtn').addEventListener('click', () => {
        showView('login-page-view');
    });
    document.getElementById('goToRegisterBtn').addEventListener('click', () => {
        showView('register-page-view');
    });
}

closeProfileButton.addEventListener('click', () => {
    showView('mainContentView');
});

saveProfileBtn.addEventListener('click', async () => {
    if (!loggedInPhoneNumber) {
        showCustomAlert("Anda harus masuk untuk menyimpan profil.");
        return;
    }
    const name = customerNameInput.value;
    const email = customerEmailInput.value;
    const sosmed = customerSosmedInput.value;
    const address = customerAddressInput.value;

    const result = await updateCustomerProfile(loggedInPhoneNumber, name, email, sosmed, address);
    if (result.success) {
        showCustomAlert("Profil Anda berhasil diperbarui!");
    } else {
        showCustomAlert(`Gagal memperbarui profil: ${result.message}`);
    }
});

openDepositFormBtn.addEventListener('click', () => {
    showView('deposit-page-view');
    if (loggedInPhoneNumber) {
        depositHandphoneInput.value = loggedInPhoneNumber;
        depositHandphoneInput.readOnly = true;
        depositNamaInput.value = customerNameInput.value;
        depositNamaInput.readOnly = true;
    } else {
        depositHandphoneInput.value = '';
        depositHandphoneInput.readOnly = false;
        depositNamaInput.value = '';
        depositNamaInput.readOnly = false;
    }
});

closeDepositButton.addEventListener('click', () => {
    showView('profile-page-view');
});

submitDepositBtn.addEventListener('click', async () => {
    const nama = depositNamaInput.value;
    const handphone = depositHandphoneInput.value;
    const amount = parseFloat(depositAmountInput.value);
    const method = depositMethodSelect.value;
    const proofFile = depositProofInput.files[0];

    if (!nama || !handphone || isNaN(amount) || amount <= 0 || !method) {
        showCustomAlert("Harap isi semua kolom deposit dengan benar.");
        return;
    }

    const isRegistered = await checkPhoneNumberRegistered(handphone);
    if (!isRegistered) {
        showCustomAlert("Nomor Handphone ini belum terdaftar. Silakan daftar terlebih dahulu.");
        return;
    }

    const result = await submitDeposit(nama, handphone, amount, method, proofFile);
    if (result.success) {
        showCustomAlert("Konfirmasi deposit Anda berhasil dikirim. Menunggu verifikasi admin.");
        depositNamaInput.value = '';
        depositHandphoneInput.value = '';
        depositAmountInput.value = '';
        depositMethodSelect.value = '';
        depositProofInput.value = '';
        showView('profile-page-view');
    } else {
        showCustomAlert(`Gagal mengirim konfirmasi deposit: ${result.message}`);
    }
});

closeRegisterButton.addEventListener('click', () => {
    showView('profile-page-view');
});

submitRegisterBtn.addEventListener('click', async () => {
    const nama = regNamaInput.value;
    const handphone = regHandphoneInput.value;
    const email = regEmailInput.value;
    const sosmed = regSosmedInput.value;
    const alamat = regAlamatInput.value;

    if (!nama || !handphone) {
        showCustomAlert("Nama Lengkap dan Nomor Handphone wajib diisi.");
        return;
    }

    const result = await registerCustomer(nama, handphone, email, sosmed, alamat);
    if (result.success) {
        showCustomAlert(result.message);
        loggedInPhoneNumber = handphone;
        localStorage.setItem('loggedInPhoneNumber', handphone);
        
        regNamaInput.value = '';
        regHandphoneInput.value = '';
        regEmailInput.value = '';
        regSosmedInput.value = '';
        regAlamatInput.value = '';
        
        showView('profile-page-view');
        profileButton.click();
    } else {
        showCustomAlert(`Pendaftaran gagal: ${result.message}`);
    }
});

closeLoginButton.addEventListener('click', () => {
    showView('profile-page-view');
});

submitLoginBtn.addEventListener('click', async () => {
    const handphone = loginHandphoneInput.value;
    if (!handphone) {
        showCustomAlert("Nomor Handphone wajib diisi.");
        return;
    }

    const isRegistered = await checkPhoneNumberRegistered(handphone);
    if (isRegistered) {
        loggedInPhoneNumber = handphone;
        localStorage.setItem('loggedInPhoneNumber', handphone);
        showCustomAlert("Berhasil masuk!");
        loginHandphoneInput.value = '';
        showView('profile-page-view');
        profileButton.click();
    } else {
        showCustomAlert("Nomor Handphone belum terdaftar. Silakan daftar terlebih dahulu.");
    }
});

customAlertOkButton.addEventListener('click', hideCustomAlert);

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartDisplay();
    if (loggedInPhoneNumber) {
        profileButton.textContent = 'Profil Saya';
    } else {
        profileButton.textContent = 'Masuk/Daftar';
    }
});
