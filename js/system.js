/* =========================================
   KOPIRATES SYSTEM CORE
   Sistem utama POS
========================================= */


/* =========================================
   REALTIME CHANNEL
   Menghubungkan menu dan dashboard
========================================= */

const channel = new BroadcastChannel("kopirates_orders")

function notifyNewOrder() {

    // kirim sinyal ke dashboard
    channel.postMessage("order_update")

}



/* =========================================
   ORDER ID GENERATOR
========================================= */

function generateOrderID() {

    let last = parseInt(localStorage.getItem("kopirates_order_number")) || 0

    last++

    localStorage.setItem("kopirates_order_number", last)

    return "KR-" + String(last).padStart(4, "0")

}

/* =========================================
   NOTIFIKASI SUARA
========================================= */

// function playOrderSound() {

    // let audio = new Audio(
        // "asets/finish.mp3"
    // )

    // audio.play()

// }


/* =========================================
   UPDATE QRIS TOTAL
========================================= */

function updateQRISTotal() {

    let img = document.querySelector(".qris-img")

    if (!img) return

    let text = "KOPIRATES-" + (typeof total !== "undefined" ? total : 0)


    let qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${text}`

    img.src = qr

}


/* =========================================
   SIMPAN ORDER KE DASHBOARD
========================================= */

function saveOrderToDashboard(order) {

    if (!order) return

    // simpan ke firebase
    if (typeof db !== "undefined") {

        db.ref("orders").push(order)

        console.log("Order dikirim ke Firebase")

    }

    // backup ke localStorage
    let orders = JSON.parse(localStorage.getItem("kopirates_orders")) || []

    orders.push(order)

    localStorage.setItem("kopirates_orders", JSON.stringify(orders))

    notifyNewOrder()
}


/* =========================================
   STORE ORDER DARI MENU
========================================= */


/* =====================================================
GO TO PAYMENT
membuka halaman pembayaran dari cart popup
===================================================== */

let paymentClicked = false // anti spam klik

function goToPayment() {

    // ===============================
    // ANTI DOUBLE CLICK
    // mencegah tombol diklik berkali-kali
    // ===============================

    if (paymentClicked) return
    paymentClicked = true


    // ===============================
    // VALIDASI CART KOSONG
    // tidak boleh lanjut jika belum ada menu
    // ===============================

    if (orders.length === 0) {

        alert("Keranjang masih kosong")

        paymentClicked = false
        return
    }


    // ===============================
    // VALIDASI MINIMAL ORDER
    // memastikan pesanan minimal Rp10.000
    // ===============================

    if (total < 10000) {

        alert("Minimal order Rp10.000")

        paymentClicked = false
        return
    }


    // ===============================
    // TUTUP POPUP CART
    // agar layar fokus ke pembayaran
    // ===============================

    closeCartPopup()


    // ===============================
    // SCROLL KE SECTION ORDER
    // menuju area pembayaran
    // ===============================

    const orderSection = document.getElementById("order")

    if (orderSection) {

        orderSection.scrollIntoView({
            behavior: "smooth"
        })

    }


    // ===============================
    // AUTO FOCUS KE INPUT NAMA
    // agar user langsung bisa isi meja/nama
    // ===============================

    setTimeout(() => {

        const input = document.getElementById("customerInput")

        if (input) {
            input.focus()
        }

    }, 400)


    // ===============================
    // RESET ANTI CLICK
    // agar tombol bisa dipakai lagi
    // ===============================

    paymentClicked = false

}

/* =====================================================
MARK ORDER AS DONE
menandai pesanan sudah selesai diambil
===================================================== */

function markOrderDone(orderID) {

    // ===============================
    // AMBIL SEMUA ORDER DARI STORAGE
    // ===============================

    let orders = JSON.parse(localStorage.getItem("kopirates_orders")) || []

    // ===============================
    // UPDATE STATUS ORDER
    // ===============================

    orders = orders.map(order => {

        if (order.id === orderID) {

            // ubah status menjadi selesai
            order.status = "done"

        }

        return order

    })

    // ===============================
    // SIMPAN KEMBALI KE STORAGE
    // ===============================

    localStorage.setItem("kopirates_orders", JSON.stringify(orders))

}
