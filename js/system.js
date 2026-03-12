let orderCounter = localStorage.getItem("kopirates_order") || 0

function generateOrderID() {

    orderCounter++

    localStorage.setItem("kopirates_order", orderCounter)

    return "KP-" + String(orderCounter).padStart(3, "0")

}

function addOrderID(message) {

    let id = generateOrderID()

    return `🧾 Order ID: ${id}%0A%0A` + message

}

function playOrderSound() {

    let audio = new Audio(
        "https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3"
    )

    audio.play()

}

function updateQRISTotal() {

    let text = "KOPIRATES-" + total

    let qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${text}`

    document.querySelector(".qris-img").src = qr

}

