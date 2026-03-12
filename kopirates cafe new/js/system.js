/* =========================================
   KOPIRATES SYSTEM CORE
   Sistem utama POS
========================================= */


/* =========================================
   REALTIME CHANNEL
   Menghubungkan menu dan dashboard
========================================= */

const channel = new BroadcastChannel("kopirates_orders")

function notifyNewOrder(){

    // kirim sinyal ke dashboard jika ada order baru
    channel.postMessage("new-order")

}


/* =========================================
   ORDER ID GENERATOR
========================================= */

let orderCounter = parseInt(localStorage.getItem("kopirates_order")) || 0

function generateOrderID(){

    orderCounter++

    localStorage.setItem("kopirates_order", orderCounter)

    return "KP-" + String(orderCounter).padStart(3,"0")

}


/* =========================================
   NOTIFIKASI SUARA
========================================= */

function playOrderSound(){

    let audio = new Audio(
        "https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3"
    )

    audio.play()

}


/* =========================================
   UPDATE QRIS TOTAL
========================================= */

function updateQRISTotal(){

    let text = "KOPIRATES-" + total

    let qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${text}`

    document.querySelector(".qris-img").src = qr

}


/* =========================================
   SIMPAN ORDER KE DASHBOARD
========================================= */

function saveOrderToDashboard(order){

    if(!order) return

    let orders = JSON.parse(localStorage.getItem("kopirates_orders")) || []

    orders.push(order)

    localStorage.setItem("kopirates_orders", JSON.stringify(orders))

    notifyNewOrder()

}