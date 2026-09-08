async function loadStatus() {
    const username = localStorage.getItem("username");

    // نمایش نام کاربری
    document.getElementById("panelUsername").innerText =
        "نام کاربری: " + (username || "تنظیم نشده");

    if (!username) {
        document.getElementById("lastUpdate").innerText = "یوزرنیم تنظیم نشده";
        return;
    }

    try {
        const res = await fetch(`https://gamenet-server-mongo.onrender.com/status/${username}`);
        const data = await res.json();

        // نمایش آخرین آپدیت
        document.getElementById("lastUpdate").innerText =
            "آخرین آپدیت: " + formatDateTime(data.lastUpdate);

        renderSystems(data.systems);

    } catch (err) {
        console.log("خطا:", err);
        document.getElementById("lastUpdate").innerText = "خطا در ارتباط با سرور";
    }
}

/* تبدیل زمان UTC به زمان ایران */
function formatDateTime(isoString) {
    if (!isoString) return "—";

    const d = new Date(isoString);
    const local = new Date(d.getTime() + (3.5 * 60 * 60 * 1000));

    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, "0");
    const day = String(local.getDate()).padStart(2, "0");
    const hour = String(local.getHours()).padStart(2, "0");
    const min = String(local.getMinutes()).padStart(2, "0");
    const sec = String(local.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

function formatPrice(num) {
    return num.toLocaleString("fa-IR");
}

function renderSystems(systems) {
    const container = document.getElementById("systems");
    container.innerHTML = "";

    if (!systems || Object.keys(systems).length === 0) {
        container.innerHTML = "<p>هیچ سیستمی ثبت نشده است.</p>";
        return;
    }

    const keys = Object.keys(systems).sort();

    keys.forEach(key => {
        const sys = systems[key];

        const snacksHTML = (sys.snacks && sys.snacks.length > 0)
            ? sys.snacks.map(sn => `
                <div class="snack-item">
                    <span>${sn.name}</span>
                    <span>${formatPrice(sn.qty)} × ${formatPrice(sn.price)} تومان</span>
                </div>
            `).join("")
            : "<p>بدون خوراکی</p>";

        const customerHTML = sys.customer
            ? `
                <div class="customer-box">
                    <p>نام مشتری: ${sys.customer.name}</p>
                    <p>کد: ${sys.customer.code}</p>
                    <p>اعتبار: ${formatPrice(sys.customer.balance)} تومان</p>
                </div>
            `
            : "<p>بدون مشتری</p>";

        const div = document.createElement("div");
        div.className = "card " + (sys.active ? "active" : "free");

        div.innerHTML = `
            <h2>${sys.name}</h2>
            <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه زمان: ${formatPrice(sys.time_cost)} تومان</p>

            <h3>خوراکی‌ها:</h3>
            ${snacksHTML}

            <p>جمع خوراکی‌ها: ${formatPrice(sys.snacks_total)} تومان</p>
            <p><strong>هزینه نهایی: ${formatPrice(sys.final_total)} تومان</strong></p>

            <h3>مشتری:</h3>
            ${customerHTML}

            <p>یادداشت: ${sys.note || "—"}</p>
        `;

        container.appendChild(div);
    });
}

loadStatus();
setInterval(loadStatus, 5000);