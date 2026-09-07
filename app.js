async function loadStatus() {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
        alert("ابتدا باید وارد شوید.");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("username").innerText = "گیم‌نت: " + username;

    try {
        const res = await fetch(`https://gamenet-server-mongo.onrender.com/status/${username}`);
        const data = await res.json();

        // ساختار جدید سرور:
        // { username, password, systems, lastUpdate }
        const systems = data.systems ? data.systems : data;

        if (!systems || Object.keys(systems).length === 0) {
            document.getElementById("lastUpdate").innerText = "آخرین آپدیت: —";
            renderSystems({});
            return;
        }

        document.getElementById("lastUpdate").innerText =
            "آخرین آپدیت: " + (data.lastUpdate || "—");

        renderSystems(systems);

    } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
        document.getElementById("lastUpdate").innerText = "خطا در ارتباط با سرور";
    }
}

function formatPrice(num) {
    return num.toLocaleString("fa-IR");
}

function renderSystems(data) {
    const container = document.getElementById("systems");
    container.innerHTML = "";

    const keys = Object.keys(data);

    if (keys.length === 0) {
        container.innerHTML = "<p>هیچ سیستمی ثبت نشده است.</p>";
        return;
    }

    const sortedKeys = keys.sort((a, b) => {
        return data[a].name.localeCompare(data[b].name, "fa");
    });

    for (let key of sortedKeys) {
        const sys = data[key];

        let snacksHTML = "";
        if (sys.snacks && sys.snacks.length > 0) {
            sys.snacks.forEach(sn => {
                snacksHTML += `
                    <div class="snack-item">
                        <span>${sn.name}</span>
                        <span>${formatPrice(sn.qty)} × ${formatPrice(sn.price)} تومان</span>
                    </div>
                `;
            });
        } else {
            snacksHTML = "<p>بدون خوراکی</p>";
        }

        let customerHTML = "";
        if (sys.customer) {
            customerHTML = `
                <div class="customer-box">
                    <p>نام مشتری: ${sys.customer.name}</p>
                    <p>کد: ${sys.customer.code}</p>
                    <p>اعتبار: ${formatPrice(sys.customer.balance)} تومان</p>
                </div>
            `;
        } else {
            customerHTML = "<p>بدون مشتری</p>";
        }

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
    }
}

loadStatus();
setInterval(loadStatus, 5000);