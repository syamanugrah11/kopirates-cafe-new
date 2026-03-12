let orders = JSON.parse(localStorage.getItem("kopirates_orders")) || []

function updateDashboard() {

    let totalOrder = orders.length
    let income = 0
    let menuCount = {}

    orders.forEach(o => {

        income += o.total

        o.items.forEach(i => {
            menuCount[i.name] = (menuCount[i.name] || 0) + i.qty
        })

    })

    document.getElementById("totalOrder").innerText = totalOrder
    document.getElementById("income").innerText = income.toLocaleString("id-ID")

    let best = Object.keys(menuCount).sort((a, b) => menuCount[b] - menuCount[a])[0] || "-"

    document.getElementById("bestMenu").innerText = best

    renderOrders()
    renderChart()

}

function renderOrders() {

    let box = document.getElementById("orders")
    box.innerHTML = ""

    orders.slice().reverse().forEach(o => {

        let status = o.paid
            ? '<span class="badge">PAID</span>'
            : '<span class="badge unpaid">UNPAID</span>'

        box.innerHTML += `

<div class="order">

<b>${o.id}</b> - ${o.type} ${status}

<br><br>

${o.items.map(i => `${i.name} x${i.qty}`).join("<br>")}

<br><br>

Total: Rp ${o.total.toLocaleString("id-ID")}

</div>

`

    })

}

function renderChart() {

    let data = orders.map(o => o.total)

    new Chart(document.getElementById("salesChart"), {

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

updateDashboard()