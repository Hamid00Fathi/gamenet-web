const username = new URLSearchParams(window.location.search).get("user");

document.getElementById("username").innerText = "کاربر: " + username;

function loadStatus() {
    fetch(`https://gamenet-server.onrender.com/status/${username}`)
        .then(r => r.json())
        .then(data => renderSystems(data))
        .catch(err => console.log("خطا:", err));
}

function renderSystems(data) {
    const container = document.getElementById("systems");
    container.innerHTML = "";

    for (let key in data) {
        const sys = data[key];

        let foodsHTML = "";
        let foodsTotal = 0;

        if (sys.foods && sys.foods.length > 0) {
            sys.foods.forEach(f => {
                foodsHTML += `
                    <div class="food-item">
                        <span>${f.name}</span>
                        <span>${f.count} × ${f.price} تومان</span>
                    </div>
                `;
            });
            foodsTotal = sys.foods_total || 0;
        }

        const finalTotal = sys.final_total || (sys.cost + foodsTotal);

        const customerHTML = sys.customer ? `
            <div class="customer-box">
                <p>مشتری: ${sys.customer.name}</p>
                <p>کد ملی: ${sys.customer.national_id}</p>
                <p>اعتبار: ${sys.customer.balance} تومان</p>
                <p>بدهی: ${sys.customer.debt} تومان</p>
            </div>
        ` : `<p>بدون حساب مشتری</p>`;

        const div = document.createElement("div");
        div.className = "card " + (sys.active ? "active" : "free");

        div.innerHTML = `
            <h2>${key}</h2>
            <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه زمان: ${sys.cost} تومان</p>

            <h3>خوراکی‌ها:</h3>
            ${foodsHTML || "<p>بدون خوراکی</p>"}

            <p>جمع خوراکی‌ها: ${foodsTotal} تومان</p>
            <p><strong>هزینه نهایی: ${finalTotal} تومان</strong></p>

            <h3>مشتری:</h3>
            ${customerHTML}
        `;

        container.appendChild(div);
    }
}

    document.getElementById("lastUpdate").innerText =
        "آخرین آپدیت: " + new Date().toLocaleTimeString();
}

loadStatus();
setInterval(loadStatus, 5000);