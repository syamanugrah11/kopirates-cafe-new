if (typeof db === "undefined") {

   console.warn("Firebase tidak aktif")

}

let bestSellerGlobal = null
let outOfStock = {} // 🔥 TAMBAHAN

// ======================================
// REALTIME SETTINGS DARI FIREBASE
// ======================================

if (typeof db !== "undefined") {

   // 🔴 MENU HABIS
   db.ref("settings/outOfStock").on("value", snap => {

      outOfStock = snap.val() || {}

      renderAllMenu() // 🔥 WAJIB refresh menu

   })

   // 🟡 BEST SELLER GLOBAL
   db.ref("settings/bestSeller").on("value", snap => {

      bestSellerGlobal = snap.val()

      renderAllMenu() // 🔥 WAJIB refresh menu

   })

}


// 🔥 WAJIB: unlock audio (taruh di sini)
document.addEventListener("click", () => {
   let audio = new Audio("asets/notif.mp3")
   audio.volume = 0
   audio.play().then(() => {
      audio.pause()
      audio.currentTime = 0
   }).catch(() => { })
}, { once: true })


// =====================================
// METODE PEMBAYARAN
// =====================================

let paymentMethod = "cash"

let paymentStatus = "BELUM BAYAR"

let orderType = "Dine In"
const DELIVERY_FEE = 10000

/* ===============================
MENU DATA
=============================== */

const coffeeMenu = [

   ["Espresso", 17000, "images/espresso.jpg", true],
   ["Americano", 17000, "images/americano.jpg", false],
   ["Cappuccino", 17000, "images/cappuccino.jpg", true],
   ["Latte", 17000, "images/latte.jpg", false],
   ["Mocha", 17000, "images/mocha.jpg", false],
   ["Caramel Macchiato", 17000, "images/caramel-macchiato.jpg", true],
   ["Vanilla Latte", 17000, "images/vanilla-latte.jpg", false],
   ["Hazelnut Latte", 17000, "images/hazelnut-latte.jpg", false],
   ["Affogato", 17000, "images/affogato.jpg", false]

]

const iceMenu = [

   ["Es Kopi Susu Gula Aren", 17000, "images/iced-coffee.jpg", true],
   ["Iced Latte", 17000, "images/iced-latte.jpg", false],
   ["Iced Americano", 17000, "images/iced-americano.jpg", false],
   ["Iced Mocha", 17000, "images/iced-mocha.jpg", false],
   ["Iced Caramel Latte", 17000, "images/iced-caramel-latte.jpg", false]

]

const nonCoffeeMenu = [

   ["Chocolate Latte", 17000, "images/chocolate-latte.jpg", true],
   ["Matcha Latte", 17000, "images/matcha-latte.jpg", false],
   ["Red Velvet Latte", 17000, "images/red-velvet-latte.jpg", false]

]

let orders = []
let total = 0

/* =====================================================
CART TIMER
membatalkan pesanan jika tidak checkout
===================================================== */

let cartTimer

function startCartTimer() {

   clearTimeout(cartTimer)

   cartTimer = setTimeout(() => {

      orders = []

      render()

      alert("Pesanan dibatalkan karena tidak diselesaikan dalam 5 menit")

   }, 300000) // 5 menit

}

// ======================================
// FORMAT ANGKA KE RUPIAH
// ======================================

function formatRupiah(number) {

   // memastikan input adalah number
   let num = Number(number)

   // jika bukan angka
   if (isNaN(num)) return "0"

   return num.toLocaleString("id-ID")

}


/* ===============================
ORDER ID
=============================== */

function generateOrderID() {

   let last = localStorage.getItem("kopirates_last_code") || 0

   last++

   localStorage.setItem("kopirates_last_code", last)

   return "KP-" + String(last).padStart(3, "0")

}

function generateQueueNumber() {

   let last = localStorage.getItem("kopirates_queue") || 0

   last++

   localStorage.setItem("kopirates_queue", last)

   return "A" + String(last).padStart(3, "0")

}


// ======================================
// RENDER MENU KE HALAMAN
// ======================================

function renderCategory(id, data) {

   let html = ""

   data.forEach(menu => {

      // =====================================
      // STRUKTUR DATA MENU (ARRAY)
      // =====================================
      // menu[0] = nama
      // menu[1] = harga
      // menu[2] = gambar
      // menu[3] = best seller
      // =====================================

      let name = menu[0]
      let price = menu[1]
      let image = menu[2]

      // 🔥 PRIORITAS BEST SELLER DARI FIREBASE
      let bestSeller = bestSellerGlobal
         ? bestSellerGlobal[name]
         : menu[3]

      // 🔴 CEK MENU HABIS DARI FIREBASE
      let isSoldOut = outOfStock[name]

      // badge best seller
      let badge = bestSeller
         ? `<span class="badge">Best Seller</span>`
         : ""

      // 🔴 tombol beda kalau habis
      let button = isSoldOut
         ? `<button disabled class="sold-out">Habis</button>`
         : `<button onclick="addOrder('${name}',${price})">Tambah</button>`

      html += `

<div class="card menu-item">

${badge}

<!-- gambar menu -->
<img src="${image}" alt="${name}">

<!-- nama menu -->
<h3>${name}</h3>

<!-- harga menu -->
<p class="price">
Rp ${formatRupiah(price)}
</p>

<!-- tombol tambah ke cart -->
${button}

</div>

`
   })

   document.getElementById(id).innerHTML = html
}

function renderAllMenu() {

   renderCategory("coffeeMenu", coffeeMenu)
   renderCategory("iceMenu", iceMenu)
   renderCategory("nonCoffeeMenu", nonCoffeeMenu)

}

/* ===============================
TAMBAH ORDER DAN HAPUS ORDER
=============================== */

function addOrder(name, price) {

   // mencari apakah menu sudah ada di cart
   let existing = orders.find(o => o.name === name)

   // =====================================
   // BATAS MAKSIMAL ORDER 10
   // =====================================

   if (existing && existing.qty >= 10) {

      alert("Maksimal 10 item per menu")

      return
   }

   // =====================================
   // JIKA SUDAH ADA
   // =====================================

   if (existing) {

      existing.qty++

   }

   // =====================================
   // JIKA BELUM ADA
   // =====================================

   else {

      orders.push({

         name: name,   // nama menu
         price: price, // harga
         qty: 1        // jumlah

      })

   }

   // render ulang cart
   render()

   // mulai timer auto cancel
   startCartTimer()

   // animasi cart
   let cart = document.getElementById("order")

   if (cart) {

      cart.style.transform = "scale(1.05)"

      setTimeout(() => {

         cart.style.transform = "scale(1)"

      }, 200)

   }

}


function removeOrder(index) {

   orders.splice(index, 1)

   render()

}

/* ===============================
ORDER TYPE
=============================== */

function setOrderType(type) {

   orderType = type

   document
      .querySelectorAll(".order-type button")
      .forEach(b => b.classList.remove("active"))

   let input = document.getElementById("customerInput")

   if (type === "Dine In") {

      document.getElementById("btn-dine").classList.add("active")
      input.setAttribute("data-lang", "customer_dine")

   }

   if (type === "Pickup") {

      document.getElementById("btn-pickup").classList.add("active")
      input.setAttribute("data-lang", "customer_pickup")

   }

   if (type === "Delivery") {

      document.getElementById("btn-delivery").classList.add("active")
      input.setAttribute("data-lang", "customer_delivery")

   }

   /* refresh bahasa */

   if (typeof applyLang === "function") {
      applyLang()
   }

   render()

}

/* ===============================
RENDER CART
=============================== */

function render() {

   total = 0

   let list = document.getElementById("orderList")

   list.innerHTML = ""

   orders.forEach((o, i) => {

      total += o.price * o.qty

      list.innerHTML += `

<div class="order-item">

${o.name} x${o.qty}

<span>
Rp ${formatRupiah(o.price * o.qty)}
</span>

<button class="delete-btn" onclick="removeOrder(${i})">
X
</button>

</div>

`

   })


   /* ===============================
   DELIVERY FEE SYSTEM
   ===============================
   - biaya delivery hanya muncul
     jika layanan = Delivery
   - dan hanya jika ada item di cart
   - fee diambil dari konstanta:
     const DELIVERY_FEE = 10000
   =============================== */

   if (orderType === "Delivery" && orders.length > 0) {

      // menambahkan fee ke total
      total += DELIVERY_FEE

      // menampilkan fee di daftar order
      list.innerHTML += `

<div class="order-item delivery-fee">

Delivery Fee

<span>
Rp ${formatRupiah(DELIVERY_FEE)}
</span>

</div>

`

   }


   document.getElementById("total").innerText = formatRupiah(total)

   // ===============================
   // ANIMASI TOTAL
   // membuat efek bounce saat order berubah
   // ===============================

   animateTotal()

   // ===============================
   // UPDATE FLOATING CART COUNT
   // ===============================

   updateCartCount()

}

/* ===============================
SEARCH MENU
=============================== */

function filterMenu() {

   let input = document.getElementById("searchMenu").value.toLowerCase()

   if (input === "") {

      document.querySelectorAll(".menu-item")
         .forEach(i => i.style.display = "block")

      document.querySelectorAll(".menu-category")
         .forEach(c => c.style.display = "block")

      return
   }

   const categories = document.querySelectorAll(".menu-category")

   categories.forEach(cat => {

      let found = false

      let items = cat.querySelectorAll(".menu-item")

      items.forEach(item => {

         let name = item.querySelector("h3").innerText.toLowerCase()

         if (name.includes(input)) {

            item.style.display = "block"
            found = true

         } else {

            item.style.display = "none"

         }

      })

      cat.style.display = found ? "block" : "none"

   })

}



/* ===============================
CATEGORY MENU
=============================== */

function showCategory(cat, btn) {

   // sembunyikan semua kategori
   document.querySelectorAll(".menu-category")
      .forEach(c => c.style.display = "none")

   // tampilkan kategori yang dipilih
   const target = document.getElementById(cat)
   if (target) {
      target.style.display = "block"
   }

   // reset tombol tab
   document.querySelectorAll(".tab-btn")
      .forEach(b => b.classList.remove("active"))

   // aktifkan tombol yang diklik
   if (btn) {
      btn.classList.add("active")
   }

}


/* ===============================
QRIS POPUP
=============================== */

function showQRIS() {

   // update QR code berdasarkan total
   if (typeof updateQRISTotal === "function") {
      updateQRISTotal()
   }

   document.getElementById("qrisTotal").innerText = formatRupiah(total)

   document.getElementById("qrisPopup").style.display = "flex"

}

function closeQRIS() {
   document.getElementById("qrisPopup").style.display = "none"
}

/* ===============================
WHATSAPP CONFIG
=============================== */

const ADMIN_WA = "6285186883211"

/* ===============================
WHATSAPP ORDER
=============================== */

function sendWhatsApp() {

   if (orders.length === 0) {

      alert("Keranjang masih kosong")

      return

   }

   paymentStatus = "BELUM BAYAR"

   sendOrder()

}

/* ======================================
CONFIRM PEMBAYARAN QRIS
customer klik "saya sudah bayar"
====================================== */

function confirmPayment() {

   // ===============================
   // QRIS TIDAK LANGSUNG LUNAS
   // status masih menunggu verifikasi
   // ===============================

   paymentMethod = "qris"
   paymentStatus = "MENUNGGU VERIFIKASI"

   // ===============================
   // kirim order ke dashboard
   // ===============================

   sendOrder()

}

// helper pembayaran
function isPaid() {
   return [
      "SUDAH BAYAR (QRIS)",
      "SUDAH BAYAR (CASH)"
   ].includes(paymentStatus)
}

/* ===============================
KIRIM ORDER
=============================== */

function sendOrder() {

   // 🔥 ANTI SPAM (WAJIB TARUH DI SINI)
   let lastOrderTime = localStorage.getItem("lastOrderTime") || 0

   if (Date.now() - lastOrderTime < 10000) {
      alert("Tunggu 10 detik sebelum order lagi")
      return
   }

   let orderID = generateOrderID()

   let queueNumber = generateQueueNumber()

   let time = getTime()

   let customerInfo = document.getElementById("customerInput").value

   let customerWA = extractWA(customerInfo)

   /* VALIDASI INPUT */

   if (customerInfo === "") {

      alert("Isi data pemesan dulu bos!")

      return

   }

   let message = ""

   message += `Kode Order: ${orderID}%0A%0A`

   if (isPaid()) {
      message += "✅ PEMBAYARAN BERHASIL%0A"
   } else if (paymentStatus === "MENUNGGU VERIFIKASI") {
      message += "🕐 MENUNGGU VERIFIKASI PEMBAYARAN (QRIS)%0A"
   } else {
      message += "⚠️ PESANAN BARU - BELUM BAYAR%0A"
   }

   message += `🕒 ${time}%0A`

   message += `Layanan: ${orderType}%0A`

   /* TAMBAHAN INFO PEMESAN */

   message += `Info Pemesan: ${customerInfo}%0A%0A`

   orders.forEach(o => {

      message += `${o.name} x${o.qty} - Rp ${formatRupiah(o.price)}%0A`

   })

   message += `%0ATotal: Rp ${formatRupiah(total)}%0A`

   if (isPaid()) {
      message += "Status: SUDAH BAYAR ✅"
   } else if (paymentStatus === "MENUNGGU VERIFIKASI") {
      message += "Status: SUDAH BAYAR (SS QRIS) ⏳"
   } else {
      message += "Status: BELUM BAYAR ❌"
   }


   /* simpan ke dashboard */

   let orderData = {

      id: orderID,

      queue: queueNumber,

      type: orderType,

      customer: customerInfo,

      customerWA: customerWA,

      items: JSON.parse(JSON.stringify(orders)),

      total: total,

      payment: paymentStatus,

      paid: isPaid(),

      verified: false,

      status: "waiting",

      lang: localStorage.getItem("kopirates_lang") || "ID",

      time: Date.now() // 🔥 TAMBAHAN PENTING

   }


   /* =========================
   SIMPAN LOCAL (DASHBOARD LAMA)
========================= */

   // ===============================
   // KIRIM NOTIFIKASI KE DASHBOARD
   // ===============================

   if (typeof notifyNewOrder === "function") {
      notifyNewOrder()
   }

   // ======================================
   // SIMPAN ORDER KE FIREBASE
   // ======================================

   if (typeof db !== "undefined") {

      db.ref("orders/" + orderID).set(orderData)


         .then(() => {

            console.log("Order berhasil disimpan")

         })

         .catch(err => {

            console.error("Firebase error:", err)

         })

   }


   /* =========================================
   SIMPAN ORDER ID CUSTOMER
   ========================================= */

   localStorage.setItem("lastOrderId", orderID)   // 🔥 WAJIB
   localStorage.setItem("lastOrderTime", Date.now())

   /* =========================================
BUKA POPUP STATUS ORDER LANGSUNG
========================================= */

   openStatusPopup(orderID)


   /* bunyi kasir */

   // playOrderSound()

   /* kirim WA */

   location.href = `https://wa.me/${ADMIN_WA}?text=${message}`

   resetOrder()

}

function extractWA(text) {

   let number = text.replace(/\D/g, "")

   if (number.startsWith("08")) {
      number = "62" + number.slice(1)
   }

   return number.length >= 10 ? number : null
}

/* ===============================
WAKTU ORDER
=============================== */

function getTime() {

   const now = new Date()

   return now.toLocaleString("id-ID", {

      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"

   })

}

/* =====================================================
SOUND PESANAN SIAP
customer diberi bunyi jika pesanan ready
===================================================== */

function playOrderReadySound() {

   try {

      let audio = new Audio("asets/notif.mp3")

      audio.play().catch(err => {
         console.warn("Audio gagal diputar:", err)
      })

   } catch (err) {

      console.warn("Error audio:", err)

   }

}


/* ===============================
RESET ORDER
=============================== */

function resetOrder() {

   // ===============================
   // KOSONGKAN ARRAY ORDER
   // ===============================

   orders = []

   total = 0

   // ===============================
   // RESET LIST ORDER DI HALAMAN
   // ===============================

   let list = document.getElementById("orderList")

   if (list) {
      list.innerHTML = ""
   }

   // ===============================
   // RESET TOTAL
   // ===============================

   let totalBox = document.getElementById("total")

   if (totalBox) {
      totalBox.innerText = "0"
   }

   // ===============================
   // RESET INPUT CUSTOMER
   // ===============================

   let input = document.getElementById("customerInput")

   if (input) {
      input.value = ""
   }

   // ===============================
   // UPDATE FLOATING CART COUNT
   // agar angka kembali ke 0
   // ===============================

   updateCartCount()

   // ===============================
   // RESET CART POPUP
   // ===============================

   let cartItems = document.getElementById("cartItems")

   if (cartItems) {
      cartItems.innerHTML = ""
   }

   let cartTotal = document.getElementById("cartTotal")

   if (cartTotal) {
      cartTotal.innerText = "0"
   }

   // ===============================
   // TUTUP POPUP CART JIKA MASIH TERBUKA
   // ===============================

   updateCartCount()
   closeCartPopup()

}

/* ======================================
KERANJANG PESANAN
====================================== */

// let cart = []

/*
Menambahkan menu ke keranjang
*/
function addToCart(name, price) {

   let existing = cart.find(item => item.name === name)

   if (existing) {

      existing.qty++

   } else {

      cart.push({
         name: name,
         price: price,
         qty: 1
      })

   }

   updateCart()

}

/*
Menghitung total keranjang
*/
function updateCart() {

   let total = 0

   cart.forEach(item => {

      total += item.price * item.qty

   })

   const totalElement = document.getElementById("totalPrice")

   if (totalElement) {

      totalElement.innerText =
         "Rp " + total.toLocaleString()

   }

}

/*
Konfirmasi pesanan
*/
function confirmOrder() {

   if (cart.length === 0) {

      alert("Pesanan kosong")

      return

   }

   const order = {

      orderID: generateOrderID(),

      items: cart,

      total: cart.reduce((t, i) => t + i.price * i.qty, 0),

      status: "NEW",

      time: Date.now()

   }

   db.ref("orders").push(order)

   alert("Pesanan berhasil dikirim!")

   cart = []

   updateCart()

}



/* ===============================
DEFAULT
=============================== */

setOrderType("Dine In")

function updateQRISTotal() {

   let totalText = document.getElementById("qrisTotal")

   if (!totalText) return

   totalText.innerText = formatRupiah(total)

}

// ===============================
// NAVBAR ACTIVE PAGE
// ===============================
// fungsi ini membaca halaman yang sedang dibuka
// lalu memberi class "active" ke menu yang sesuai

function setActiveNav() {

   // mengambil nama file dari URL
   const path = window.location.pathname.split("/").pop()

   // mencari semua link navbar
   document.querySelectorAll(".nav-links a").forEach(link => {

      const href = link.getAttribute("href")

      // jika href sama dengan halaman sekarang
      if (href === path) {

         // tambahkan class active
         link.classList.add("active")

      }

   })

}

// ===============================
// ANIMASI TOTAL ORDER
// ===============================

function animateTotal() {

   // mencari box total
   const totalBox = document.querySelector(".order-total")

   // jika tidak ada maka hentikan
   if (!totalBox) return

   // tambahkan class animasi
   totalBox.classList.add("added-animation")

   // hapus animasi setelah selesai
   setTimeout(() => {

      totalBox.classList.remove("added-animation")

   }, 300)

}

// ===============================
// INIT PAGE
// dijalankan saat halaman selesai dimuat
// ===============================

window.addEventListener("DOMContentLoaded", function () {

   // mengaktifkan navbar sesuai halaman
   setActiveNav()

})

/* =====================================================
TOGGLE CART
membuka atau menutup keranjang pesanan
===================================================== */

function toggleCart() {

   let cart = document.querySelector(".order-box")

   if (cart.style.display === "block") {

      cart.style.display = "none"

   } else {

      cart.style.display = "block"

   }

}

/* =====================================================
UPDATE CART COUNT
menghitung jumlah item dari array orders
lebih stabil dibanding membaca DOM
===================================================== */

function updateCartCount() {

   let count = 0

   // menghitung total quantity
   orders.forEach(o => {

      count += o.qty

   })

   let cart = document.getElementById("cartCount")

   if (cart) {

      cart.innerText = count

   }

}

/* =====================================================
OPEN CART POPUP
membuka popup pesanan
===================================================== */

function openCartPopup() {

   document.getElementById("cartPopup").style.display = "flex"

   renderCartPopup()

}

/* =====================================================
CLOSE CART POPUP
menutup popup pesanan
===================================================== */

function closeCartPopup() {

   document.getElementById("cartPopup").style.display = "none"

}

/* =====================================================
RENDER CART POPUP
menampilkan semua pesanan di popup cart
mengikuti struktur HTML #cartItems
===================================================== */

function renderCartPopup() {

   // ambil container list
   const box = document.getElementById("cartItems")

   // kosongkan isi sebelum render ulang
   box.innerHTML = ""

   let totalPopup = 0

   // looping semua pesanan
   orders.forEach((o, i) => {

      // membuat container item
      const div = document.createElement("div")

      // class untuk styling CSS
      div.classList.add("popup-item")

      div.innerHTML = `

            <!-- nama menu dan jumlah -->
            <span>
                ${o.name} x${o.qty}
            </span>

            <!-- harga item -->
            <span>
                Rp ${formatRupiah(o.price * o.qty)}
            </span>

            <!-- tombol hapus item -->
            <button class="delete-btn"
            onclick="removeOrder(${i}); renderCartPopup();">
            ❌
            </button>

        `

      // masukkan item ke popup
      box.appendChild(div)

      // hitung total
      totalPopup += o.price * o.qty

   })

   // update total harga popup
   document.getElementById("cartTotal").innerText =
      formatRupiah(totalPopup)

}

/* =========================================
CONNECT BUTTON CART → PAYMENT SECTION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

   const checkoutBtn = document.getElementById("checkoutBtn")

   if (checkoutBtn) {

      checkoutBtn.addEventListener("click", goToPayment)

   }

})

/* =====================================================
BUKA POPUP STATUS ORDER
===================================================== */

function openStatusPopup(orderId) {

   // ✅ FIX STABILITAS (WAJIB TARUH DI SINI)
   if (typeof db === "undefined") {
      console.warn("Firebase tidak aktif")
      return
   }

   let popup = document.getElementById("statusPopup")

   if (!popup) return

   popup.style.display = "flex"

   // tampilkan order ID
   document.getElementById("customerOrderId").innerText = orderId


   /* =========================================
   AMBIL STATUS AWAL DARI FIREBASE
   ========================================= */

   db.ref("orders/" + orderId).on("value", function (snapshot) {

      let myOrder = snapshot.val()
      if (!myOrder) return

      renderCustomerOrderDetail(myOrder)
      updateCustomerStatus(myOrder.status)

   })

}

/* =====================================================
RENDER DETAIL PESANAN CUSTOMER DI POPUP
fungsi ini menampilkan semua data order
===================================================== */

function renderCustomerOrderDetail(order) {

   console.log("DATA ORDER:", order)

   // ambil container detail
   let box = document.getElementById("customerOrderDetail")

   if (!box) return

   let html = ""

   /* ===============================
   INFO PEMESAN
   =============================== */

   html += `
   <div class="detail-row">
   <strong>Layanan :</strong> ${order.type}
   </div>

   <div class="detail-row">
   <strong>Info Pemesan :</strong> ${order.customer}
   </div>

   <div class="detail-row" style="font-size:20px; font-weight:bold; color:gold;">
   <strong>No Antrian :</strong> ${order.queue || "-"}
   </div>
   `

   /* ===============================
   DAFTAR MENU
   =============================== */

   html += `<div class="detail-menu">`

   Object.values(order.items || {}).forEach(item => {

      html += `
      <div class="detail-item">

      <span>
      ${item.name} x${item.qty}
      </span>

      <span>
      Rp ${formatRupiah(item.price * item.qty)}
      </span>

      </div>
      `
   })

   html += `</div>`

   /* ===============================
   TOTAL PESANAN
   =============================== */

   html += `
   <div class="detail-total">
   <strong>Total :</strong> Rp ${formatRupiah(order.total)}
   </div>
   `

   /* ===============================
   STATUS PEMBAYARAN
   =============================== */

   html += `
   <div class="detail-payment">

   <strong>Status Bayar :</strong>

   ${order.payment === "MENUNGGU VERIFIKASI"
         ? "⏳ Menunggu konfirmasi kasir"
         : order.paid
            ? "✅ Pembayaran dikonfirmasi"
            : "❌ Belum bayar"}


   </div>
   `

   /* ===============================
   MASUKKAN KE HTML
   =============================== */

   box.innerHTML = html

}


/* =====================================================
TUTUP POPUP STATUS
digunakan ketika customer menekan tombol tutup
===================================================== */

function closeStatusPopup() {

   // menyembunyikan popup
   document.getElementById("statusPopup").style.display = "none"

}

/* =====================================================
TOGGLE STATUS POPUP
memunculkan kembali popup jika disembunyikan
dan menyimpan status ke localStorage
===================================================== */

function toggleStatusPopup() {

   let popup = document.getElementById("statusPopup")

   if (!popup) return

   if (popup.style.display === "flex") {

      // ===============================
      // SEMBUNYIKAN POPUP
      // ===============================

      popup.style.display = "none"

      // ===============================
      // SIMPAN STATUS POPUP DISSEMBUNYIKAN
      // agar setelah refresh tidak muncul lagi
      // ===============================

      localStorage.setItem("kopirates_popup_hidden", "true")

   } else {

      // ===============================
      // TAMPILKAN POPUP
      // ===============================

      popup.style.display = "flex"

      // ===============================
      // HAPUS STATUS HIDDEN
      // ===============================

      localStorage.removeItem("kopirates_popup_hidden")

   }

}



/* =====================================================
REALTIME STATUS LISTENER
mendengarkan perubahan status dari dashboard
===================================================== */

if (typeof db !== "undefined") {

   db.ref("orders").on("child_changed", function (snapshot) {

      let order = snapshot.val()

      // ambil order ID milik customer
      let myOrderId = localStorage.getItem("lastOrderId")

      // jika belum ada order → hentikan
      if (!myOrderId) return

      // jika order bukan milik customer → abaikan
      if (order.id !== myOrderId) return

      console.log("Status berubah:", order.status)

      // panggil fungsi untuk update popup
      updateCustomerStatus(order.status)

      // 🔥 TAMBAHAN INI (PENTING BANGET)
      renderCustomerOrderDetail(order)

      if (order.paid && window.lastPaidOrderId !== order.id) {

         alert("Pembayaran sudah dikonfirmasi ✅")

         window.lastPaidOrderId = order.id
      }

      /* ===============================
      🔊 NOTIF READY (ANTI DOUBLE)
      =============================== */

   })

} else {

   console.warn("Firebase tidak aktif (listener tidak dijalankan)")

}

/* =====================================================
UPDATE STATUS POPUP CUSTOMER
fungsi ini yang mengatur semua teks status
===================================================== */

let lastStatus = null

function updateCustomerStatus(status) {

   let statusText = ""

   let stepHTML = ""

   let statusBox = document.getElementById("customerStatus")
   if (!statusBox) return

   /* ======================================
   KONDISI STATUS ORDER
   ====================================== */

   // 🔔 PLAY SOUND SAAT STATUS BERUBAH KE READY
   if (status === "ready" && lastStatus !== "ready") {
      playOrderReadySound()
      lastStatus = "ready"
   }

   if (status === "waiting") {

      statusText = "🕒 Pesanan masuk, menunggu dibuat"

      stepHTML = `
   <div class="step active">Diterima</div>
   <div class="step">Diproses</div>
   <div class="step">Siap</div>
   `
      statusBox.style.color = "gold"
      statusBox.style.fontWeight = "bold"
   }

   else if (status === "making") {

      statusText = "☕ Pesanan sedang dibuat"

      stepHTML = `
   <div class="step done">Diterima</div>
   <div class="step active">Diproses</div>
   <div class="step">Siap</div>
   `
      statusBox.style.color = "orange"
      statusBox.style.fontWeight = "bold"
   }

   else if (status === "ready") {

      statusText = "🎉 Pesanan siap diambil"

      stepHTML = `
   <div class="step done">Diterima</div>
   <div class="step done">Diproses</div>
   <div class="step active">Siap</div>
   `
      statusBox.style.color = "lightgreen"
      statusBox.style.fontWeight = "bold"
   }

   else if (status === "canceled") {

      statusText = "❌ Pesanan dibatalkan"

      stepHTML = `
   <div class="step cancel">Dibatalkan</div>
   `

      // ✅ TAMBAHAN DI SINI
      statusBox.style.color = "red"
      statusBox.style.fontWeight = "bold"



      // ======================================
      // ORDER SUDAH SELESAI
      // hapus order dari localStorage
      // agar popup tidak muncul lagi setelah refresh
      // ======================================

      localStorage.removeItem("lastOrderId")

      // hapus status popup hidden
      // agar sistem popup kembali normal
      // untuk order berikutnya
      localStorage.removeItem("kopirates_popup_hidden")

      // sembunyikan popup setelah 3 detik
      setTimeout(() => {

         let popup = document.getElementById("statusPopup")

         if (popup) {
            popup.style.display = "none"
         }

      }, 3000)

   }


   else {

      statusText = "Menunggu konfirmasi..."
      statusBox.style.color = "white"

   }

   /* ======================================
   ANIMASI PERUBAHAN STATUS
   ====================================== */

   statusBox.style.opacity = "0"

   setTimeout(() => {

      statusBox.innerHTML = `
   <div>${statusText}</div>
   <div class="step-container">
   ${stepHTML}
   </div>
   `
      statusBox.style.opacity = "1"

   }, 200)

}

/* =====================================================
CEK ORDER TERAKHIR CUSTOMER
popup muncul jika customer kembali dari WA
===================================================== */

window.addEventListener("load", function () {

   let lastOrderId = localStorage.getItem("lastOrderId")

   if (lastOrderId) {

      db.ref("orders/" + lastOrderId).once("value", snapshot => {

         let order = snapshot.val()

         // kalau order tidak ada → hapus
         if (!order) {
            localStorage.removeItem("lastOrderId")
            return
         }

         // 🔥 CEK STATUS
         if (order.status === "ready" || order.status === "canceled") {

            localStorage.removeItem("lastOrderId")

            let popup = document.getElementById("statusPopup")
            if (popup) popup.style.display = "none"

            return
         }

         // ✅ hanya buka kalau masih aktif
         openStatusPopup(lastOrderId)

      })

   }

})


/* =====================================================
CEK STATUS POPUP SAAT HALAMAN DIMUAT
Popup hanya muncul jika masih ada pesanan aktif
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

   let popup = document.getElementById("statusPopup")

   if (!popup) return

   // ===============================
   // CEK STATUS POPUP DI LOCALSTORAGE
   // ===============================

   let popupHidden = localStorage.getItem("kopirates_popup_hidden")

   // ===============================
   // CEK DATA ORDER
   // ===============================

   let lastOrderId = localStorage.getItem("lastOrderId")

   if (!lastOrderId || popupHidden === "true") {
      popup.style.display = "none"
      return
   }

   // 🔥 TAMBAHAN CEK KE FIREBASE
   db.ref("orders/" + lastOrderId).once("value", snapshot => {

      let order = snapshot.val()

      if (!order || order.status === "ready" || order.status === "canceled") {

         localStorage.removeItem("lastOrderId")
         popup.style.display = "none"

      } else {

         openStatusPopup(lastOrderId)

      }

   })

})


function selectQRIS() {

   paymentMethod = "qris"

}

function selectCash() {

   paymentMethod = "cash"

}

/* ======================================
PILIH METODE PEMBAYARAN
====================================== */

function selectPayment(method) {

   paymentMethod = method

   // ===============================
   // JIKA CASH
   // langsung dianggap lunas
   // ===============================

   if (method === "cash") {

      paymentStatus = "SUDAH BAYAR (CASH)"

   }

   // ===============================
   // JIKA QRIS
   // masih menunggu verifikasi
   // ===============================

   if (method === "qris") {

      paymentStatus = "MENUNGGU VERIFIKASI"

   }

}

