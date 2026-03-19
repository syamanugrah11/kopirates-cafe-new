const langData = {

    id: {

        home: "Beranda",
        menu: "Menu",
        order: "Pesanan",
        about: "Tentang",

        tagline: "Grand Line Pirate Coffee Adventure",
        lihat_menu: "Lihat Menu",

        welcome: "Selamat Datang",
        desc: "Cafe dengan konsep bajak laut yang menghadirkan pengalaman kopi seperti petualangan di Grand Line.",

        menu_title: "Menu KOPIRATES",
        search_menu: "Cari menu...",
        order_title: "Pesanan",
        total: "Total",

        pay_qris: "Bayar QRIS 💳",
        pay_cash: "Bayar Tunai 💵",

        dinein: "Makan di Tempat",
        pickup: "Ambil Sendiri",
        delivery: "Pesan Antar",

        qris_payment: "Pembayaran QRIS",
        scan_qr: "Scan QR Code untuk melakukan pembayaran",
        total_pay: "Total Pembayaran",
        confirm_pay: "Saya Sudah Membayar",

        dashboard: "Dashboard Kasir",
        total_order: "Total Pesanan",
        income: "Total Pendapatan",
        best_menu: "Menu Terlaris",
        status: "Status",
        waiting: "Menunggu pesanan...",
        incoming_order: "Pesanan Masuk",

        about_title: "Tentang KOPIRATES Coffee",
        contact_admin: "Hubungi Admin",
        cafe_address: "Alamat Cafe",

        reset_today: "Reset Hari Ini",
        sales_chart: "Grafik Penjualan",

        customer_dine: "Nama Pelanggan / Posisi?",
        customer_pickup: "Nama Pelanggan / Mo Ambil Kapan? (19.30)",
        customer_delivery: "Nama Pelanggan / ShareLok Bos dan No WA (WAJIB!)",

        about_desc: `KOPIRATES Coffee adalah tempat ngopi dengan konsep petualangan laut.
Kami menyajikan berbagai minuman kopi dan non kopi dengan kualitas terbaik
dengan harga terjangkau.

Nikmati pengalaman minum kopi yang berbeda seperti petualangan di Grand Line.`,

        whatsapp: "📱 Chat WhatsApp",

        address_full: "📍 Jl. Anggrek Perumnas No.5, Madawat",

        footer_copy: "© 2026 KOPIRATES Coffee",

        best_today: "🔥 Terlaris Hari Ini",

    },

    en: {

        home: "Home",
        menu: "Menu",
        order: "Order",
        about: "About",

        tagline: "Grand Line Pirate Coffee Adventure",
        lihat_menu: "View Menu",

        welcome: "Welcome",
        desc: "A pirate themed cafe bringing a coffee experience like an adventure on the Grand Line.",

        menu_title: "KOPIRATES Menu",
        search_menu: "Search menu...",
        order_title: "Orders",
        total: "Total",

        pay_qris: "Pay QRIS 💳",
        pay_cash: "Pay Cash 💵",

        dinein: "Dine In",
        pickup: "Pick Up",
        delivery: "Delivery",

        qris_payment: "QRIS Payment",
        scan_qr: "Scan the QR code to complete payment",
        total_pay: "Total Payment",
        confirm_pay: "I Have Paid",

        dashboard: "Cashier Dashboard",
        total_order: "Total Orders",
        income: "Total Revenue",
        best_menu: "Best Seller",
        status: "Status",
        waiting: "Waiting for orders...",
        incoming_order: "Incoming Orders",

        about_title: "About KOPIRATES Coffee",
        contact_admin: "Contact Admin",
        cafe_address: "Cafe Address",

        reset_today: "Reset Today",
        sales_chart: "Sales Chart",

        customer_dine: "Customer Name / Table Number",
        customer_pickup: "Customer Name / Pickup Time",
        customer_delivery: "Customer Name / Delivery Address and WA Number (REQUIRED!)",

        about_desc: `KOPIRATES Coffee is a coffee shop with a sea adventure concept.
We serve a variety of coffee and non-coffee drinks with the best quality
at affordable prices.

Enjoy a different coffee experience like an adventure on the Grand Line.`,

        whatsapp: "📱 WhatsApp Chat",

        address_full: "📍 Jl. Anggrek Perumnas No.5, Madawat",

        footer_copy: "© 2026 KOPIRATES Coffee",

        best_today: "🔥 Best Seller Today",

    }

}

function setLang(lang, btn) {

    localStorage.setItem("lang", lang)

    applyLang()

    document.querySelectorAll(".lang-btn").forEach(b => {
        b.classList.remove("active")
    })

    btn.classList.add("active")

}

function applyLang() {

    let lang = localStorage.getItem("lang") || "id"

    document.querySelectorAll("[data-lang]").forEach(el => {

        let key = el.getAttribute("data-lang")

        if (langData[lang][key]) {

            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {

                el.placeholder = langData[lang][key]

            } else {

                el.textContent = langData[lang][key]

            }

        }

    })

}

function syncLangButton() {

    let lang = localStorage.getItem("lang") || "id"

    let buttons = document.querySelectorAll(".lang-btn")

    buttons.forEach(btn => {

        btn.classList.remove("active")

        if (btn.textContent.trim().toLowerCase() === lang) {
            btn.classList.add("active")
        }

    })

}

document.addEventListener("DOMContentLoaded", () => {

    applyLang()
    syncLangButton()

})