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

    let bestMenu = Object.keys(menuCount)
        .sort((a, b) => menuCount[b] - menuCount[a])[0] || "-"

    document.getElementById("bestMenu").innerText = bestMenu

    renderOrders()
    renderChart()

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

    db.ref("orders/" + key).update({
        status: "ready"
    })

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

        let expired = o.time && (now - o.time > 300000)

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

setInterval(autoCancelOrders, 10000)

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

        let sisa = 300000 - (now - start)

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