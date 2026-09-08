// گرفتن وضعیت از سرور و رندر کردن صفحه
async function loadStatus() {
    const username = localStorage.getItem("username");

    const panelUsernameEl = document.getElementById("panelUsername");
    const lastUpdateEl = document.getElementById("lastUpdate");

    panelUsernameEl.innerText = "نام کاربری: " + (username || "تنظیم نشده");

    if (!username) {
        lastUpdateEl.innerText = "یوزرنیم تنظیم نشده";
        return;
    }

    try {
        const res = await fetch(`https://gamenet-server-mongo.onrender.com/status/${username}`);
        const data = await res.json();

        lastUpdateEl.innerText = "آخرین آپدیت: " + data.lastUpdate;

        renderSystems(data.systems);
    } catch (err) {
        lastUpdateEl.innerText = "خطا در ارتباط با سرور";
    }
}

// فرمت کردن عدد به تومان فارسی
function formatPrice(num) {
    return num.toLocaleString("fa-IR");
}

// رندر کردن کارت‌ها در صفحه اصلی (نمای ساده)
function renderSystems(systems) {
    const container = document.getElementById("systems");
    container.innerHTML = "";

    const keys = Object.keys(systems).sort();

    keys.forEach(key => {
        const sys = systems[key];

        const div = document.createElement("div");
        div.className = "card " + (sys.active ? "active" : "free");

        // نمای ساده: فقط زمان، هزینه نهایی، یادداشت
        div.innerHTML = `
            <h2>${sys.name}</h2>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه نهایی: ${formatPrice(sys.final_total)} تومان</p>
            <p>یادداشت: ${sys.note || "—"}</p>
        `;

        // کلیک روی کارت → نمایش کامل در مودال
        div.addEventListener("click", () => openModalFull(sys));

        container.appendChild(div);
    });
}

// رندر خوراکی‌ها برای مودال
function renderSnacks(snacks) {
    if (!snacks || snacks.length === 0) {
        return "<p>بدون خوراکی</p>";
    }

    return snacks.map(sn => `
        <div class="snack-item">
            <span>${sn.name}</span>
            <span>${sn.qty} × ${formatPrice(sn.price)} تومان</span>
        </div>
    `).join("");
}

// رندر اطلاعات مشتری برای مودال
function renderCustomer(c) {
    if (!c) {
        return "<p>بدون مشتری</p>";
    }

    return `
        <div class="customer-box">
            <p>نام مشتری: ${c.name}</p>
            <p>کد: ${c.code}</p>
            <p>اعتبار: ${formatPrice(c.balance)} تومان</p>
        </div>
    `;
}

// باز کردن مودال با اطلاعات کامل سیستم
function openModalFull(sys) {
    const modal = document.getElementById("modal");
    const content = document.getElementById("modalContent");

    content.innerHTML = `
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

    modal.classList.add("modal-active");
    modal.style.display = "block";
}

// بستن مودال — بعد از لود کامل صفحه
window.onload = () => {
    const closeBtn = document.getElementById("closeModal");

    closeBtn.onclick = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
        modal.classList.remove("modal-active");
    };
};

// اولین بار و بعد هر ۵ ثانیه وضعیت را بگیر
loadStatus();
setInterval(loadStatus, 5000);