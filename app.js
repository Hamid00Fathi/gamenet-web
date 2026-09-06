async function loadStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("user");

    if (!username) {
        alert("یوزرنیم در URL مشخص نشده!");
        return;
    }

    document.getElementById("username").innerText = username;

    try {
        const res = await fetch(`https://gamenet-server.onrender.com/status/${username}`);
        const data = await res.json();
        renderSystems(data);

    } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
    }
}

function renderSystems(data) {
    const container = document.getElementById("systems");
    container.innerHTML = "";

    for (let key in data) {
        const sys = data[key];

        // خوراکی‌ها
        let snacksHTML = "";
        let snacksTotal = sys.snacks_total || 0;

        if (sys.snacks && sys.snacks.length > 0) {
            sys.snacks.forEach(sn => {
                snacksHTML += `
                    <div class="snack-item">
                        <span>${sn.name}</span>
                        <span>${sn.qty} × ${sn.price} تومان</span>
                    </div>
                `;
            });
        } else {
            snacksHTML = "<p>بدون خوراکی</p>";
        }

        // مشتری
        let customerHTML = "";
        if (sys.customer) {
            customerHTML = `
                <div class="customer-box">
                    <p>نام مشتری: ${sys.customer.name}</p>
                    <p>کد: ${sys.customer.code}</p>
                    <p>اعتبار: ${sys.customer.balance} تومان</p>
                </div>
            `;
        } else {
            customerHTML = "<p>بدون مشتری</p>";
        }

        // هزینه نهایی
        const finalTotal = sys.final_total || (sys.cost + snacksTotal);

        // ساخت کارت
        const div = document.createElement("div");
        div.className = "card " + (sys.active ? "active" : "free");

        div.innerHTML = `
            <h2>${sys.name}</h2>
            <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه زمان: ${sys.cost} تومان</p>

            <h3>خوراکی‌ها:</h3>
            ${snacksHTML}

            <p>جمع خوراکی‌ها: ${snacksTotal} تومان</p>
            <p><strong>هزینه نهایی: ${finalTotal} تومان</strong></p>

            <h3>مشتری:</h3>
            ${customerHTML}

            <p>یادداشت: ${sys.note || "—"}</p>
        `;

        container.appendChild(div);
    }
}

// آپدیت هر ۵ ثانیه
loadStatus();
setInterval(loadStatus, 5000);