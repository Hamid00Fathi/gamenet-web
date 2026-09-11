// ===============================
//  ابزارهای کمکی
// ===============================

// فرمت تومان
function formatPrice(num) {
    return Number(num || 0).toLocaleString("fa-IR");
}

// محاسبه روزهای مانده
function calcDaysLeft(expireDate) {
    const today = new Date();
    const exp = new Date(expireDate);
    const diff = exp - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ===============================
//  دریافت اشتراک
// ===============================
async function loadSubscription() {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
        const res = await fetch(`https://gamenet-server-mongo.onrender.com/subscription/${username}`);
        const data = await res.json();

        const expire = data.expireDate || "—";
        const active = data.active;

        document.getElementById("subExpire").innerText = "تاریخ پایان: " + expire;

        let daysLeft = calcDaysLeft(expire);

        // جلوگیری از منفی شدن روزهای مانده
        if (daysLeft < 0 && active) daysLeft = 1;

        if (active) {
            document.getElementById("subDaysLeft").innerText = "روزهای مانده: " + daysLeft;

            document.getElementById("menuSubExpire").innerText = "پایان: " + expire;
            document.getElementById("menuSubDaysLeft").innerText = "مانده: " + daysLeft + " روز";

            document.getElementById("subscriptionExpired").style.display = "none";

            // پیشرفت اشتراک (۳۰ روز = ۱۰۰٪)
            const percent = Math.min(100, Math.max(0, (daysLeft / 30) * 100));
            document.getElementById("progressBarInner").style.width = percent + "%";

        } else {
            document.getElementById("subDaysLeft").innerText = "اشتراک فعال نیست";
            document.getElementById("menuSubDaysLeft").innerText = "غیرفعال";
            document.getElementById("subscriptionExpired").style.display = "block";
            document.getElementById("progressBarInner").style.width = "0%";
        }

    } catch (err) {
        console.log("خطا در اشتراک:", err);
    }
}

// ===============================
//  دریافت وضعیت سیستم‌ها
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

        if (!data.systems || Object.keys(data.systems).length === 0) {
            console.log("سیستم‌ها خالی هستند، تلاش مجدد...");
            return;
        }

        renderSystems(data.systems);

    } catch (err) {
        console.log("خطا در ارتباط با سرور:", err);
        lastUpdateEl.innerText = "خطا در ارتباط با سرور";
    }
}

// ===============================
//  مرتب‌سازی سیستم‌ها
// ===============================
function sortSystems(systemsObj) {
    const systems = Object.entries(systemsObj);

    return systems.sort((a, b) => {
        const nameA = a[1].name;
        const nameB = b[1].name;

        const numA = parseInt((nameA.match(/\d+/g) || ["9999"])[0], 10);
        const numB = parseInt((nameB.match(/\d+/g) || ["9999"])[0], 10);

        const isPCA = nameA.toLowerCase().includes("pc");
        const isPCB = nameB.toLowerCase().includes("pc");

        if (isPCA && !isPCB) return -1;
        if (!isPCA && isPCB) return 1;

        return numA - numB;
    });
}

// ===============================
//  رندر سیستم‌ها
// ===============================
function renderSystems(systemsObj) {
    const systemsDiv = document.getElementById("systems");
    systemsDiv.innerHTML = "";

    const sorted = sortSystems(systemsObj);

    let activeCount = 0;
    let freeCount = 0;
    let totalCost = 0;

    sorted.forEach(([key, sys]) => {
        if (sys.active === 1 || sys.active === 2) activeCount++;
        else freeCount++;

        totalCost += sys.final_total;

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

    document.getElementById("qsActive").innerText = activeCount;
    document.getElementById("qsFree").innerText = freeCount;
    document.getElementById("qsTotalCost").innerText = formatPrice(totalCost);
}

// ===============================
//  رندر خوراکی‌ها
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
//  رندر مشتری
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
//  مودال کامل سیستم
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

        <div class="total-box">
            <p>جمع خوراکی‌ها: ${formatPrice(sys.snacks_total)} تومان</p>
            <p><strong>هزینه نهایی: ${formatPrice(sys.final_total)} تومان</strong></p>
        </div>

        <h3>مشتری:</h3>
        ${renderCustomer(sys.customer)}

        <p>یادداشت: ${sys.note || "—"}</p>
    `;

    modal.style.display = "block";
}

// ===============================
//  بستن مودال
// ===============================
window.onload = () => {
    document.getElementById("closeModal").onclick = () => {
        document.getElementById("modal").style.display = "none";
    };
};

// ===============================
//  اسلایدر خودکار کارت‌های اشتراک
// ===============================
setInterval(() => {
    const slider = document.getElementById("subscriptionSlider");
    slider.scrollLeft += 350;

    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
        slider.scrollLeft = 0;
    }
}, 4000);

// ===============================
//  اجرای اولیه + رفرش خودکار
// ===============================
async function startAutoRefresh() {
    await loadSubscription();
    await loadStatus();

    setInterval(() => {
        loadSubscription();
        loadStatus();
    }, 5000);
}

startAutoRefresh();