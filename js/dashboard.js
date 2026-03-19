/* =====================================================
DASHBOARD KOPIRATES
===================================================== */

let orders = []
let chart = null
let lastOrderCount = 0
let isFirstLoad = true
let newOrderIds = new Set()
let notifQueue = 0
let notifTimeout = null

const ALL_MENU = [
    "Espresso",
    "Americano",
    "Cappuccino",
    "Latte",
    "Mocha",
    "Caramel Macchiato",
    "Vanilla Latte",
    "Hazelnut Latte",
    "Affogato",
    "Es Kopi Susu Gula Aren",
    "Iced Latte",
    "Iced Americano",
    "Iced Mocha",
    "Iced Caramel Latte",
    "Chocolate Latte",
    "Matcha Latte",
    "Red Velvet Latte"
]

/* =====================================================
REALTIME FIREBASE LISTENER
===================================================== */

db.ref("orders").on("value", function (snapshot) {

    isFirstLoad = false

    let data = snapshot.val()

    if (!data) {

        orders = []
        updateDashboard()
        return
    }

    let newCount = Object.keys(data).length

    // if (newCount > lastOrderCount) {

    //     playNotification()

    // }

    lastOrderCount = newCount

    orders = Object.keys(data).map(key => ({
        firebaseKey: key,
        ...data[key]
    }))

    orders.sort((a, b) => {

        // 🔥 PRIORITAS 1: WAKTU TERBARU (PALING ATAS)
        let timeDiff = (b.time || 0) - (a.time || 0)
        if (timeDiff !== 0) return timeDiff

        // 🔥 PRIORITAS 2: STATUS
        const priority = {
            "waiting": 1,
            "making": 2,
            "ready": 3,
            "canceled": 4
        }

        return (priority[a.status] || 99) - (priority[b.status] || 99)

    })

    updateDashboard()

})

db.ref("orders").on("child_added", function (snapshot) {

    let order = snapshot.val()

    // skip bunyi saat pertama load
    if (isFirstLoad) return

    // 🔥 INIT PENYIMPAN ORDER
    if (!window.lastOrders) window.lastOrders = new Set()

    // 🔥 CEK AGAR TIDAK DOUBLE
    if (!window.lastOrders.has(order.id)) {

        window.lastOrders.add(order.id)

        console.log("Order baru masuk 🔥")

        // 🔔 bunyi notif dashboard
        smartNotification()

        // ✨ tandai order baru
        newOrderIds.add(order.id)
    }

})



/* =====================================================
SOUND ORDER
===================================================== */

function playNotification() {

    let audio = document.getElementById("notifSound")

    if (!audio) {
        console.log("Audio tidak ditemukan")
        return
    }

    audio.currentTime = 0 // reset biar bisa bunyi berulang
    audio.play().catch(err => {
        console.log("Audio blocked:", err)
    })

}

function smartNotification() {

    notifQueue++

    // kalau sudah ada timer → jangan buat lagi
    if (notifTimeout) return

    notifTimeout = setTimeout(() => {

        console.log(`🔥 ${notifQueue} order baru masuk`)

        if (notifQueue >= 3) {
            console.log("🚨 RAMAI BANGET!")
        }

        playNotification()

        // reset
        notifQueue = 0
        notifTimeout = null

    }, 2000) // delay 2 detik (biar ngumpulin)
}

/* =====================================================
UPDATE DASHBOARD
===================================================== */

function updateDashboard() {

    let totalOrder = orders.length
    let income = 0
    let menuCount = {}

    orders.forEach(o => {

        income += o.total

        if (o.items) {

            Object.values(o.items || {}).forEach(i => {

                menuCount[i.name] =
                    (menuCount[i.name] || 0) + i.qty

            })

        }

    })

    document.getElementById("totalOrder").innerText = totalOrder
    document.getElementById("income").innerText = income.toLocaleString("id-ID")

    renderOrders()
    renderChart()
    renderBestSeller(menuCount)

}

/* =====================================================
UPDATE BEST MENU
===================================================== */

function renderBestSeller(menuCount) {

    let box = document.getElementById("bestMenuList")
    if (!box) return

    box.innerHTML = ""

    let sorted = Object.keys(menuCount)
        .map(name => ({
            name,
            qty: menuCount[name]
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)

    // ambil bahasa aktif
    let lang = localStorage.getItem("lang") || "id"

    if (sorted.length === 0) {

        box.innerHTML = (lang === "en")
            ? "No data yet"
            : "Belum ada data"

        return
    }

    sorted.forEach((item, index) => {

        box.innerHTML += `
        <div class="best-item">
            <div class="best-rank">${index + 1}</div>
            <div class="best-name">${item.name}</div>
            <div class="best-qty">${item.qty}</div>
        </div>
        `

    })

}

/* =====================================================
RENDER MENU CONTROL
===================================================== */

function renderMenuControl(outOfStockData = {}) {

    let box = document.getElementById("menuControl")
    if (!box) return

    box.innerHTML = ""

    ALL_MENU.forEach(name => {

        let checked = outOfStockData[name] ? "checked" : ""

        box.innerHTML += `
        <label style="display:block; margin:5px 0;">
            <input type="checkbox" value="${name}" ${checked}>
            ${name}
        </label>
        `
    })

}

db.ref("settings/outOfStock").on("value", snap => {
    let data = snap.val() || {}
    renderMenuControl(data)
})

function saveOutOfStock() {

    let checkboxes = document.querySelectorAll("#menuControl input[type=checkbox]")

    let data = {}

    checkboxes.forEach(cb => {
        if (cb.checked) {
            data[cb.value] = true
        }
    })

    db.ref("settings/outOfStock").set(data)

    alert("Menu habis berhasil diupdate 🔥")

}

/* =====================================================
RENDER ORDER LIST
===================================================== */

function renderOrders() {

    let box = document.getElementById("orders")

    box.innerHTML = ""

    let reversedOrders = orders

    reversedOrders.forEach(o => {

        let isCanceled = o.status === "canceled"

        let statusBtn = ""

        if (o.status === "canceled") {

            statusBtn = `❌ DIBATALKAN (EXPIRED)`

        }
        else if (o.status === "waiting" && !isCanceled) {

            statusBtn = `
    <button onclick="startOrder('${o.firebaseKey}')">
    Mulai Buat
    </button>
    `

        }
        else if (o.status === "making" && !isCanceled) {

            statusBtn = `
        <button onclick="finishOrder('${o.firebaseKey}')">
        Selesai
        </button>
         `

        }
        else {

            statusBtn = "✅ Siap Diambil"

        }


        let payStatus = ""

        if (o.paid) {

            payStatus = "✅ Lunas"

        }
        else if (!isCanceled) {

            payStatus = `
        ❌ Belum Bayar
        <br>
        <button onclick="payOrder('${o.firebaseKey}')">
        SUDAH BAYAR
        </button>
        `

        }
        else {

            payStatus = "❌ Order Dibatalkan"

        }



        let items = ""

        Object.values(o.items || {}).forEach(i => {

            items += `
        <div style="display:flex; justify-content:space-between;">
        <span>${i.name} x${i.qty}</span>
        <span>Rp ${(i.price * i.qty).toLocaleString("id-ID")}</span>
        </div>
        `
        })

        box.innerHTML += `
            <div class="order 
            ${isCanceled ? 'canceled' : ''} 
            ${newOrderIds.has(o.id) ? 'new-order' : ''}">

            <div class="order-code">${o.id}</div>

            <div>
            <b>${o.customer}</b> 
            <span class="order-type-badge ${o.type.toLowerCase()}">
            ${o.type}
            </span>
            </div>

            <div style="color:gold; font-weight:bold;">
            No Antrian: ${o.queue || "-"}
            </div>

            ${(o.payment === "MENUNGGU VERIFIKASI"
                && !o.paid
                && o.status === "waiting"
                && (o.type === "Pickup" || o.type === "Delivery"))
                ? `<div class="qris-timer" data-time="${o.time}">
                ⏱ Menunggu pembayaran...
                </div>`
                : ""}

            <br>

            ${items}

            <br>

            <div style="font-weight:bold;">
            Total: Rp ${o.total.toLocaleString("id-ID")}
            </div>

            <div>
            ${payStatus}
            </div>

                <div>
                ${o.status === "ready"
                ? `<span class="ready-status">✅ Siap Diambil</span>`
                : o.status === "making"
                    ? "🛠 Diproses"
                    : o.status === "waiting"
                        ? "⏳ Menunggu"
                        : "❌ Dibatalkan"}
                </div>

               <div class="order-actions">
                ${statusBtn}
                </div>
                `

    })

    setTimeout(() => {
        newOrderIds.clear()
    }, 2000)

}

/* =====================================================
CHART PENJUALAN
===================================================== */

function renderChart() {

    let data = orders.map(o => o.total)

    if (chart) chart.destroy()

    chart = new Chart(document.getElementById("salesChart"), {

        type: "line",

        data: {

            labels: orders.map((o, i) => "Order " + (i + 1)),

            datasets: [{

                label: "Penjualan",

                data: data,

                borderColor: "gold",

                backgroundColor: "rgba(255,215,0,.2)"

            }]

        }

    })

}

/* =====================================================
VERIFIKASI BAYAR
===================================================== */

function payOrder(id) {

    db.ref("orders/" + id).update({

        paid: true,
        payment: "SUDAH BAYAR (MANUAL)"

    })

}


/* =====================================================
                    PROSES PESANAN
===================================================== */

function startOrder(id) {

    db.ref("orders/" + id).update({

        status: "making"

    })

}

function finishOrder(key) {

    let order = orders.find(o => o.firebaseKey === key)

    db.ref("orders/" + key).update({
        status: "ready"
    })

    // ======================================
    // AUTO WHATSAPP KE CUSTOMER
    // ======================================

    if (!order) return

    // ⚠️ format nomor WA dari input customer
    let customerWA = extractWA(order.customer)

    if (!customerWA) {
        console.warn("Nomor WA tidak ditemukan")
        return
    }

    let message = `Halo, pesanan kamu sudah siap 🎉%0A`
    message += `Kode: ${order.id}%0A`
    message += `Silakan ambil di kasir 🙌`

    window.open(`https://wa.me/${customerWA}?text=${message}`, "_blank")
}

function extractWA(text) {
    // ambil angka dari input customer
    let number = text.replace(/\D/g, "")

    // ubah 08 → 628
    if (number.startsWith("08")) {
        number = "62" + number.slice(1)
    }

    return number.length >= 10 ? number : null
}


/* =====================================================
RESET ORDER
===================================================== */

function resetOrders() {

    if (confirm("Reset semua order hari ini?")) {

        db.ref("orders").remove()

    }

}


// ======================================
// AUTO CANCEL QRIS (5 MENIT)
// ======================================

function autoCancelOrders() {

    let now = Date.now()

    orders.forEach(o => {

        let isQRIS = o.payment === "MENUNGGU VERIFIKASI"
        let notPaid = !o.paid
        let isPickupOrDelivery =
            o.type === "Pickup" || o.type === "Delivery"
        let isStillWaiting = o.status === "waiting"

        let expired = o.time && (now - o.time > 100000)

        if (
            isQRIS &&
            notPaid &&
            isPickupOrDelivery &&
            isStillWaiting &&
            expired
        ) {

            console.log("AUTO CANCEL:", o.id)

            db.ref("orders/" + o.firebaseKey).update({
                status: "canceled"
            })

        }

    })

}

setInterval(autoCancelOrders, 1000)

document.addEventListener("touchstart", unlockAudio, { once: true })
document.addEventListener("click", unlockAudio, { once: true })

function unlockAudio() {

    let audio = document.getElementById("notifSound")

    if (!audio) return

    audio.play()
        .then(() => {
            audio.pause()
            audio.currentTime = 0
            console.log("Audio unlocked 🔊")
        })
        .catch(() => { })

}

setInterval(() => {

    document.querySelectorAll(".qris-timer").forEach(el => {

        let start = Number(el.getAttribute("data-time"))
        let now = Date.now()

        let sisa = 100000 - (now - start)

        if (sisa <= 0) {
            el.innerHTML = "❌ Expired"
            el.style.color = "red"
            return
        }

        let menit = Math.floor(sisa / 60000)
        let detik = Math.floor((sisa % 60000) / 1000)

        el.innerHTML = `⏱ ${menit}:${detik.toString().padStart(2, "0")}`

    })

}, 1000)

let clickCount = 0

document.getElementById("logo").addEventListener("click", () => {

    clickCount++

    if (clickCount >= 5) {

        clickCount = 0 // reset biar ga spam

        alert("Admin mode aktif 😈")

        openAdminPanel()

    }

})

function openAdminPanel() {

    let menu = prompt(
        "Mode Admin:\n\n1. Set Best Seller\n2. Set Menu Habis"
    )

    if (menu === "1") {
        setBestSeller()
    }

    if (menu === "2") {
        setOutOfStock()
    }
}

function setBestSeller() {

    let name = prompt("Masukkan nama menu BEST SELLER:")

    if (!name) return

    db.ref("settings/bestSeller").once("value", snap => {

        let data = snap.val() || {}

        // toggle
        if (data[name]) {
            delete data[name]
            alert(name + " dihapus dari Best Seller")
        } else {
            data[name] = true
            alert(name + " jadi Best Seller 🔥")
        }

        db.ref("settings/bestSeller").set(data)

    })

}

function setOutOfStock() {
    alert("Gunakan panel Menu Habis di dashboard ⬇️")
}