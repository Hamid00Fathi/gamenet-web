// ===============================
//  دریافت وضعیت از سرور
// ===============================
async function loadStatus() {
    const username = localStorage.getItem("username");

    const panelUsernameEl = document.getElementById("panelUsername");
    const lastUpdateEl = document.getElementById("lastUpdate");

    // نمایش نام کاربری
    panelUsernameEl.innerText = "نام کاربری: " + (username || "تنظیم نشده");

    if (!username) {
        lastUpdateEl.innerText = "یوزرنیم تنظیم نشده";
        return;
    }

    try {
        const res = await fetch(`https://gamenet-server-mongo.onrender.com/status/${username}`);

        // اگر سرور جواب نداد
        if (!res.ok) {
            lastUpdateEl.innerText = "خطا در ارتباط با سرور";
            return;
        }

        const data = await res.json();

        // جلوگیری از کرش در صورت نبود lastUpdate
        lastUpdateEl.innerText = "آخرین آپدیت: " + (data.lastUpdate || "—");

        // جلوگیری از کرش در صورت نبود systems
        if (!data.systems || typeof data.systems !== "object") {
            console.log("سیستم‌ها دریافت نشدند یا ساختار اشتباه است");
            return;
        }

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
//  رندر کردن کارت‌های سیستم‌ها
// ===============================
function renderSystems(systemsObj) {
    const systemsDiv = document.getElementById("systems");
    systemsDiv.innerHTML = "";

    // تبدیل شیء به آرایه
    const systems = Object.values(systemsObj);

    const sortedSystems = systems.sort((a, b) => {
        // اگر فیلد عددی مشخص داری، اینجا بذار
        // مثلاً اگر سرور فیلد number می‌فرسته:
        // const numA = Number(a.number);
        // const numB = Number(b.number);

        // فعلاً از name عدد استخراج می‌کنیم
        const numA = Number(String(a.name).match(/\d+/)?.[0] || 0);
        const numB = Number(String(b.name).match(/\d+/)?.[0] || 0);

        return numA - numB;
    });

    sortedSystems.forEach(sys => {
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
            <p>هزینه نهایی: ${safeNum(sys.final_total)} تومان</p>
            <p>یادداشت: ${sys.note || "—"}</p>
        `;

        card.onclick = () => openModal(sys);

        systemsDiv.appendChild(card);
    });
}

// ===============================
//  رندر خوراکی‌ها در مودال
// ===============================
function renderSystems(systemsObj) {
    const systemsDiv = document.getElementById("systems");
    systemsDiv.innerHTML = "";

    // تبدیل به آرایه + مرتب‌سازی عددی
    const sortedSystems = Object.values(systemsObj).sort((a, b) => {
        return Number(a.name.replace(/\D/g, "")) - Number(b.name.replace(/\D/g, ""));
    });

    sortedSystems.forEach(sys => {
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
            <p>هزینه نهایی: ${safeNum(sys.final_total)} تومان</p>
            <p>یادداشت: ${sys.note || "—"}</p>
        `;

        card.onclick = () => openModal(sys);

        systemsDiv.appendChild(card);
    });
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
//  اجرای اولیه + آپدیت هر ۵ ثانیه
// ===============================
loadStatus(); // اولین بار
setInterval(loadStatus, 5000); // هر ۵ ثانیه