// =======================
// داده‌های نمونه سیستم‌ها
// =======================
const systemsData = [
  {
    id: 1,
    name: "سیستم ۱",
    active: true,
    elapsed: "01:20",
    time_cost: 45000,
    snacks_total: 15000,
    final_total: 60000,
    snacks: [
      { name: "نوشابه", qty: 2, price: 8000 },
      { name: "چیپس", qty: 1, price: 7000 }
    ],
    customer: {
      name: "مشتری ۱",
      phone: "09120000000"
    },
    note: "دوست دارد پلی‌استیشن بازی کند."
  },
  {
    id: 2,
    name: "سیستم ۲",
    active: false,
    elapsed: null,
    time_cost: 0,
    snacks_total: 0,
    final_total: 0,
    snacks: [],
    customer: {
      name: "—",
      phone: "—"
    },
    note: ""
  },
  {
    id: 3,
    name: "سیستم ۳",
    active: true,
    elapsed: "00:45",
    time_cost: 30000,
    snacks_total: 10000,
    final_total: 40000,
    snacks: [
      { name: "آب معدنی", qty: 1, price: 5000 }
    ],
    customer: {
      name: "مشتری ۲",
      phone: "09130000000"
    },
    note: "زمان محدود."
  }
];

// =======================
// کمک‌تابع‌ها
// =======================
function formatPrice(value) {
  if (!value) return "0";
  return value.toLocaleString("fa-IR");
}

function renderSnacks(snacks) {
  if (!snacks || snacks.length === 0) {
    return "<p>خوراکی ثبت نشده است.</p>";
  }

  let html = "<ul>";
  snacks.forEach(s => {
    html += `<li>${s.name} × ${s.qty} — ${formatPrice(s.price * s.qty)} تومان</li>`;
  });
  html += "</ul>";
  return html;
}

function renderCustomer(customer) {
  if (!customer) {
    return "<p>اطلاعات مشتری موجود نیست.</p>";
  }
  return `
    <p>نام: ${customer.name || "—"}</p>
    <p>شماره: ${customer.phone || "—"}</p>
  `;
}

// =======================
// رندر سیستم‌ها روی داشبورد
// =======================
const systemsContainer = document.getElementById("systems");
const qsActive = document.getElementById("qsActive");
const qsFree = document.getElementById("qsFree");
const qsTotalCost = document.getElementById("qsTotalCost");

function renderSystems() {
  systemsContainer.innerHTML = "";

  let activeCount = 0;
  let freeCount = 0;
  let totalCost = 0;

  systemsData.forEach(sys => {
    if (sys.active) {
      activeCount++;
      totalCost += sys.final_total || 0;
    } else {
      freeCount++;
    }

    const card = document.createElement("div");
    card.className = "card " + (sys.active ? "active" : "free");
    card.innerHTML = `
      <h2>${sys.name}</h2>
      <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
      <p>زمان: ${sys.elapsed || "—"}</p>
      <p>هزینه نهایی: ${formatPrice(sys.final_total)} تومان</p>
    `;

    card.addEventListener("click", () => openSystemModal(sys));
    systemsContainer.appendChild(card);
  });

  qsActive.textContent = activeCount;
  qsFree.textContent = freeCount;
  qsTotalCost.textContent = formatPrice(totalCost);
}

// =======================
// اشتراک و نوار پیشرفت
// =======================
const subExpire = document.getElementById("subExpire");
const subDaysLeft = document.getElementById("subDaysLeft");
const menuSubExpire = document.getElementById("menuSubExpire");
const menuSubDaysLeft = document.getElementById("menuSubDaysLeft");
const subscriptionInfo = document.getElementById("subscriptionInfo");
const subscriptionExpired = document.getElementById("subscriptionExpired");
const progressBarInner = document.getElementById("progressBarInner");

function initSubscription() {
  // داده نمونه اشتراک
  const totalDays = 30;
  const usedDays = 10; // مثلا ۱۰ روز گذشته
  const daysLeft = totalDays - usedDays;

  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + daysLeft);

  const expireStr = expireDate.toLocaleDateString("fa-IR");

  subExpire.textContent = "تاریخ پایان اشتراک: " + expireStr;
  subDaysLeft.textContent = "روزهای باقی‌مانده: " + daysLeft;

  menuSubExpire.textContent = "پایان اشتراک: " + expireStr;
  menuSubDaysLeft.textContent = "باقی‌مانده: " + daysLeft + " روز";

  const percent = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));
  progressBarInner.style.width = percent + "%";

  if (daysLeft <= 0) {
    subscriptionExpired.style.display = "block";
    subscriptionInfo.style.display = "none";
  } else {
    subscriptionExpired.style.display = "none";
    subscriptionInfo.style.display = "block";
  }
}

// =======================
// مودال سیستم‌ها
// =======================
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModal");

function openSystemModal(sys) {
  modalContent.innerHTML = `
    <div class="modalSection">
      <h3>اطلاعات سیستم</h3>
      <p>نام سیستم: ${sys.name}</p>
      <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
      <p>زمان سپری شده: ${sys.elapsed || "—"}</p>
    </div>

    <div class="costBox">
      <h3>هزینه‌ها</h3>
      <p>هزینه زمان: ${formatPrice(sys.time_cost)} تومان</p>
      <p>جمع خوراکی‌ها: ${formatPrice(sys.snacks_total)} تومان</p>
      <div class="finalTotal">هزینه نهایی: ${formatPrice(sys.final_total)} تومان</div>
    </div>

    <div class="modalSection">
      <h3>خوراکی‌ها</h3>
      ${renderSnacks(sys.snacks)}
    </div>

    <div class="modalSection">
      <h3>مشتری</h3>
      ${renderCustomer(sys.customer)}
    </div>

    <div class="modalSection">
      <h3>یادداشت</h3>
      <p>${sys.note || "—"}</p>
    </div>
  `;

  modal.style.display = "block";
}

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// =======================
// اطلاعات کاربر (نمونه ساده)
// =======================
const panelUsername = document.getElementById("panelUsername");
const lastUpdate = document.getElementById("lastUpdate");

function initUserPanel() {
  const username = localStorage.getItem("username") || "کاربر مهمان";
  panelUsername.textContent = "کاربر: " + username;

  const now = new Date();
  lastUpdate.textContent = "آخرین بروزرسانی: " + now.toLocaleString("fa-IR");
}

// =======================
// راه‌اندازی اولیه
// =======================
window.addEventListener("load", () => {
  initUserPanel();
  initSubscription();
  renderSystems();
});