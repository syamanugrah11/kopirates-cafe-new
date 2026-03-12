let paymentStatus = "BELUM BAYAR"

let orderType = "Dine In"
const DELIVERY_FEE = 10000

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

function formatRupiah(n) {
    return n.toLocaleString("id-ID")
}

function generateOrderID(){

let last = localStorage.getItem("order_number") || 0

last++

localStorage.setItem("order_number", last)

return "KP-" + String(last).padStart(3,"0")

}

function saveOrder(orderType,total,orders,paymentStatus){

let orderData={

id:generateOrderID(),

type:orderType,

items:orders,

total:total,

paid:paymentStatus==="SUDAH BAYAR QRIS"

}

let list=JSON.parse(localStorage.getItem("kopirates_orders")) || []

list.push(orderData)

localStorage.setItem("kopirates_orders",JSON.stringify(list))

}

function renderCategory(id, data) {

    let html = ""

    data.forEach(m => {

        let badge = m[3] ? `<span class="badge">Best Seller</span>` : ""

        html += `

<div class="card menu-item">

${badge}

<img src="${m[2]}">

<h3>${m[0]}</h3>

<p class="price">Rp ${formatRupiah(m[1])}</p>

<button onclick="addOrder('${m[0]}',${m[1]})">
Tambah
</button>

</div>

`

    })

    document.getElementById(id).innerHTML = html

}

renderCategory("coffeeMenu", coffeeMenu)
renderCategory("iceMenu", iceMenu)
renderCategory("nonCoffeeMenu", nonCoffeeMenu)

function addOrder(name, price) {

    let existing = orders.find(o => o.name === name)

    if (existing) {
        existing.qty++
    } else {
        orders.push({ name, price, qty: 1 })
    }

    render()

    let cart = document.getElementById("order")

    cart.style.transform = "scale(1.05)"

    setTimeout(() => {
        cart.style.transform = "scale(1)"
    }, 200)

}

function setOrderType(type) {

    orderType = type

    document
        .querySelectorAll(".order-type button")
        .forEach(b => b.classList.remove("active"))

    if (type === "Dine In") {
        document.getElementById("btn-dine").classList.add("active")
    }

    if (type === "Pickup") {
        document.getElementById("btn-pickup").classList.add("active")
    }

    if (type === "Delivery") {
        document.getElementById("btn-delivery").classList.add("active")
    }

    render()

}

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

</div>

`

    })

    if (orderType === "Delivery") {

        total += DELIVERY_FEE

        list.innerHTML += `

<div class="order-item">

Delivery Fee

<span style="color:gold">
Rp ${formatRupiah(DELIVERY_FEE)}
</span>

</div>

`

    }

    document.getElementById("total").innerText = formatRupiah(total)

}

function filterMenu() {

    let input = document.getElementById("searchMenu").value.toLowerCase()

    let items = document.querySelectorAll(".menu-item")

    items.forEach(item => {

        let name = item.querySelector("h3").innerText.toLowerCase()

        if (name.includes(input)) {
            item.style.display = "block"
        } else {
            item.style.display = "none"
        }

    })

}

function showCategory(cat) {

    document.querySelectorAll(".menu-category")
        .forEach(c => c.style.display = "none")

    document.getElementById(cat).style.display = "block"

    document.querySelectorAll(".tab-btn")
        .forEach(b => b.classList.remove("active"))

    event.target.classList.add("active")

}

const ADMIN_WA = "6282245499145"

function showQRIS() {

    updateQRISTotal()

    document.getElementById("qrisPopup").style.display = "flex"

}

function closeQRIS() {
    document.getElementById("qrisPopup").style.display = "none"
}

function sendWhatsApp() {

    if (orders.length === 0) {
        alert("Keranjang masih kosong")
        return
    }

    paymentStatus = "BELUM BAYAR"

    sendOrder()

}

function confirmPayment() {

    paymentStatus = "SUDAH BAYAR (QRIS)"

    closeQRIS()

    sendOrder()

}

function sendOrder() {

    let time = getTime()

    let message = createMessage()

    message = addOrderID(message)

    storeOrderDashboard()

    playOrderSound()

    window.open(`https://wa.me/${ADMIN_WA}?text=${message}`)

    if (paymentStatus === "SUDAH BAYAR (QRIS)") {

        message += "✅ PEMBAYARAN BERHASIL!!!%0A"
        message += "BUKTI SS PEMBAYARAN NAKAMA (QRIS)%0A"

    } else {

        message += "⚠️ PESANAN BARU - BELUM BAYAR%0A"
        message += "Silakan lakukan pembayaran terlebih dahulu%0A"

    }

    message += `🕒 ${time}%0A`

    message += `Layanan: ${orderType}%0A%0A`

    orders.forEach(o => {

        message += `${o.name} - Rp ${o.price}%0A`

    })

    message += `%0ATotal: Rp ${total}%0A`

    if (paymentStatus === "SUDAH BAYAR (QRIS)") {

        message += "Status: SUDAH BAYAR QRIS ✅%0A"
        message += "(SERTAKAN BUKTI PEMBAYARAN)"

    } else {

        message += "Status: BELUM BAYAR ❌"

    }

    storeOrderDashboard()

    playOrderSound()

    window.open(`https://wa.me/${ADMIN_WA}?text=${message}`)

}

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

/* ===============================
TAMBAHAN SISTEM ORDER KOPIRATES
================================ */

/* Tambahkan Order ID ke pesan */

function addOrderID(message){

let orderID = generateOrderID()

let header = `Kode Order: ${orderID}%0A%0A`

return header + message

}


/* Buat pesan dasar order */

function createMessage(){

let msg=""

orders.forEach(o=>{

msg += `${o.name} - Rp ${o.price}%0A`

})

return msg

}


/* Simpan order ke dashboard */

function storeOrderDashboard(){

let orderData={

id:generateOrderID(),

type:orderType,

items:orders,

total:total,

paid:paymentStatus==="SUDAH BAYAR (QRIS)"

}

let list=JSON.parse(localStorage.getItem("kopirates_orders"))||[]

list.push(orderData)

localStorage.setItem("kopirates_orders",JSON.stringify(list))

}


/* Bunyi notifikasi kasir */

function playOrderSound(){

let audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3")

audio.play()

}

setOrderType("Dine In")