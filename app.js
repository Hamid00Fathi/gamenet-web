async function loadStatus() {
    const username = localStorage.getItem("username");

    document.getElementById("panelUsername").innerText =
        "نام کاربری: " + (username || "تنظیم نشده");

    if (!username) {
        document.getElementById("lastUpdate").innerText = "یوزرنیم تنظیم نشده";
        return;
    }

    try {
        const res = await fetch(`https://gamenet-server-mongo.onrender.com/status/${username}`);
        const data = await res.json();

        document.getElementById("lastUpdate").innerText =
            "آخرین آپدیت: " + data.lastUpdate;

        renderSystems(data.systems);

    } catch (err) {
        document.getElementById("lastUpdate").innerText = "خطا در ارتباط با سرور";
    }
}

function formatPrice(num) {
    return num.toLocaleString("fa-IR");
}

function renderSystems(systems) {
    const container = document.getElementById("systems");
    container.innerHTML = "";

    const keys = Object.keys(systems).sort();

    keys.forEach(key => {
        const sys = systems[key];

        const div = document.createElement("div");
        div.className = "card " + (sys.active ? "active" : "free");

        div.innerHTML = `
            <h2>${sys.name}</h2>
            <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه زمان: ${formatPrice(sys.time_cost)} تومان</p>

            <h3>خوراکی‌ها:</h3>
            ${renderSnacks(sys.snacks)}

            <p>جمع خوراکی‌ها: ${formatPrice(sys.snacks_total)} تومان</p>
            <p><strong>هزینه نهایی: ${formatPrice(sys.final_total)} تومان</strong></p>

            <h3>مشتری:</h3>
            ${renderCustomer(sys.customer)}

            <p>یادداشت: ${sys.note || "—"}</p>
        `;

        /* کلیک روی کارت → مودال تمام‌صفحه */
        div.addEventListener("click", () => openModal(div.innerHTML));

        container.appendChild(div);
    });
}

function renderSnacks(snacks) {
    if (!snacks || snacks.length === 0) return "<p>بدون خوراکی</p>";

    return snacks.map(sn => `
        <div class="snack-item">
            <span>${sn.name}</span>
            <span>${formatPrice(sn.qty)} × ${formatPrice(sn.price)} تومان</span>
        </div>
    `).join("");
}

function renderCustomer(c) {
    if (!c) return "<p>بدون مشتری</p>";
    return `
        <div class="customer-box">
            <p>نام مشتری: ${c.name}</p>
            <p>کد: ${c.code}</p>
            <p>اعتبار: ${formatPrice(c.balance)} تومان</p>
        </div>
    `;
}

function openModal(html) {
    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modal").style.display = "block";
}

document.getElementById("closeModal").onclick = () => {
    document.getElementById("modal").style.display = "none";
};

loadStatus();
setInterval(loadStatus, 5000);