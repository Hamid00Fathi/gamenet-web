// ===============================
//  دریافت وضعیت از سرور
// ===============================
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
        // جلوگیری از کش مرورگر
        const res = await fetch(
            `https://gamenet-server-mongo.onrender.com/status/${username}?t=${Date.now()}`,
            { cache: "no-store" }
        );

        if (!res.ok) {
            lastUpdateEl.innerText = "خطا در ارتباط با سرور";
            return;
        }

        const data = await res.json();

        lastUpdateEl.innerText = "آخرین آپدیت: " + (data.lastUpdate || "—");

        // اگر سیستم‌ها خالی بود، باز هم تلاش کن
        if (!data.systems || Object.keys(data.systems).length === 0) {
            console.log("سیستم‌ها خالی هستند، تلاش مجدد...");
            return;
        }

        // اجرای رندر
        renderSystems(data.systems);

    } catch (err) {
        console.log("خطا در ارتباط با سرور:", err);
        lastUpdateEl.innerText = "خطا در ارتباط با سرور";
    }
}

// ===============================
//  فرمت کردن عدد به تومان فارسی
// ===============================
function formatPrice(num) {
    return Number(num || 0).toLocaleString("fa-IR");
}

// ===============================
//  رندر کردن کارت‌های سیستم‌ها (نسخهٔ درست و نهایی)
// ===============================
function renderSystems(systemsObj) {
    const systemsDiv = document.getElementById("systems");
    systemsDiv.innerHTML = "";

    // تبدیل شیء به آرایه همراه با کلید
    const systems = Object.entries(systemsObj);

    // مرتب‌سازی بر اساس نام سیستم (pc1 → pc2 → pc10)
    const sortedSystems = systems.sort((a, b) => {
        const nameA = a[1].name;
        const nameB = b[1].name;

        // استخراج عدد از نام
        const numA = parseInt(nameA.match(/\d+/)?.[0] || "9999", 10);
        const numB = parseInt(nameB.match(/\d+/)?.[0] || "9999", 10);

        return numA - numB;
    });

    // ساخت کارت‌ها
    sortedSystems.forEach(([key, sys]) => {
        const card = document.createElement("div");
        card.className = "card";

        if (sys.active === 1 || sys.active === 2) card.classList.add("active");
        else card.classList.add("free");

        card.innerHTML = `
            <h2>${sys.name}</h2>
            <p>وضعیت: ${
                sys.active === 1 ? "فعال" :
                sys.active === 2 ? "مکث" :
                "آزاد"
            }</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه نهایی: ${formatPrice(sys.final_total)} تومان</p>
            <p>یادداشت: ${sys.note || "—"}</p>
        `;

        card.onclick = () => openModalFull(sys);

        systemsDiv.appendChild(card);
    });
}

// ===============================
//  رندر خوراکی‌ها در مودال
// ===============================
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

// ===============================
//  رندر مشتری در مودال
// ===============================
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

// ===============================
//  باز کردن مودال کامل سیستم
// ===============================
function openModalFull(sys) {
    const modal = document.getElementById("modal");
    const content = document.getElementById("modalContent");

    content.innerHTML = `
        <h2>${sys.name}</h2>

        <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
        <p>زمان: ${sys.elapsed || "—"}</p>
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

// ===============================
//  بستن مودال
// ===============================
window.onload = () => {
    const closeBtn = document.getElementById("closeModal");

    closeBtn.onclick = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
        modal.classList.remove("modal-active");
    };
};

// ===============================
//  اجرای اولیه + رفرش خودکار تضمینی
// ===============================
async function startAutoRefresh() {
    await loadStatus(); // اولین بار همیشه اجرا می‌شود

    setInterval(() => {
        loadStatus(); // هر ۵ ثانیه بدون توقف
    }, 5000);
}

startAutoRefresh();