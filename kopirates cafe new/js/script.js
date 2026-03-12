let paymentStatus = "BELUM BAYAR"

let orderType = "Dine In"

const DELIVERY_FEE = 10000

/* ===============================
   MENU DATA
=============================== */

const coffeeMenu = [

["Espresso",17000,"images/espresso.jpg",true],
["Americano",17000,"images/americano.jpg",false],
["Cappuccino",17000,"images/cappuccino.jpg",true],
["Latte",17000,"images/latte.jpg",false],
["Mocha",17000,"images/mocha.jpg",false],
["Caramel Macchiato",17000,"images/caramel-macchiato.jpg",true],
["Vanilla Latte",17000,"images/vanilla-latte.jpg",false],
["Hazelnut Latte",17000,"images/hazelnut-latte.jpg",false],
["Affogato",17000,"images/affogato.jpg",false]

]

const iceMenu = [

["Es Kopi Susu Gula Aren",17000,"images/iced-coffee.jpg",true],
["Iced Latte",17000,"images/iced-latte.jpg",false],
["Iced Americano",17000,"images/iced-americano.jpg",false],
["Iced Mocha",17000,"images/iced-mocha.jpg",false],
["Iced Caramel Latte",17000,"images/iced-caramel-latte.jpg",false]

]

const nonCoffeeMenu = [

["Chocolate Latte",17000,"images/chocolate-latte.jpg",true],
["Matcha Latte",17000,"images/matcha-latte.jpg",false],
["Red Velvet Latte",17000,"images/red-velvet-latte.jpg",false]

]


/* ===============================
   ORDER DATA
=============================== */

let orders = []

let total = 0


function formatRupiah(n){

return n.toLocaleString("id-ID")

}


/* ===============================
   RENDER MENU
=============================== */

function renderCategory(id,data){

let html=""

data.forEach(m=>{

let badge=m[3]?`<span class="badge">Best Seller</span>`:""

html+=`

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

document.getElementById(id).innerHTML=html

}


renderCategory("coffeeMenu",coffeeMenu)
renderCategory("iceMenu",iceMenu)
renderCategory("nonCoffeeMenu",nonCoffeeMenu)


/* ===============================
   TAMBAH ORDER
=============================== */

function addOrder(name,price){

let existing=orders.find(o=>o.name===name)

if(existing){

existing.qty++

}else{

orders.push({name,price,qty:1})

}

render()

}


/* ===============================
   SET ORDER TYPE
=============================== */

function setOrderType(type){

orderType=type

document
.querySelectorAll(".order-type button")
.forEach(b=>b.classList.remove("active"))

if(type==="Dine In"){
document.getElementById("btn-dine").classList.add("active")
}

if(type==="Pickup"){
document.getElementById("btn-pickup").classList.add("active")
}

if(type==="Delivery"){
document.getElementById("btn-delivery").classList.add("active")
}

render()

}


/* ===============================
   RENDER CART
=============================== */

function render(){

total=0

let list=document.getElementById("orderList")

list.innerHTML=""

orders.forEach(o=>{

total+=o.price*o.qty

list.innerHTML+=`

<div class="order-item">

${o.name} x${o.qty}

<span>
Rp ${formatRupiah(o.price*o.qty)}
</span>

</div>

`

})

if(orderType==="Delivery"){

total+=DELIVERY_FEE

list.innerHTML+=`

<div class="order-item">

Delivery Fee

<span style="color:gold">
Rp ${formatRupiah(DELIVERY_FEE)}
</span>

</div>

`

}

document.getElementById("total").innerText=formatRupiah(total)

}


/* ===============================
   QRIS
=============================== */

function showQRIS(){

updateQRISTotal()

document.getElementById("qrisPopup").style.display="flex"

}

function closeQRIS(){

document.getElementById("qrisPopup").style.display="none"

}


/* ===============================
   WHATSAPP ORDER
=============================== */

const ADMIN_WA="6282245499145"


function sendWhatsApp(){

if(orders.length===0){

alert("Keranjang masih kosong")

return

}

paymentStatus="BELUM BAYAR"

sendOrder()

}


function confirmPayment(){

paymentStatus="SUDAH BAYAR (QRIS)"

closeQRIS()

sendOrder()

}


/* ===============================
   KIRIM ORDER
=============================== */

function sendOrder(){

let orderID = generateOrderID()

let message=""

orders.forEach(o=>{

message+=`${o.name} x${o.qty}%0A`

})

message+=`%0ATotal: Rp ${formatRupiah(total)}`


let orderData={

id:orderID,
type:orderType,
items:orders,
total:total,
paid:paymentStatus==="SUDAH BAYAR (QRIS)"

}

saveOrderToDashboard(orderData)

playOrderSound()

window.open(`https://wa.me/${ADMIN_WA}?text=${message}`)

}

setOrderType("Dine In")