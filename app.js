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

        const systems = data.systems || {};

        // 🔥 تبدیل زمان UTC به زمان ایران + فرمت خوانا
        function formatDateTime(isoString) {
            if (!isoString) return "—";

            const d = new Date(isoString);

            // تبدیل UTC به زمان ایران
            const local = new Date(d.getTime() + (3.5 * 60 * 60 * 1000));

            const year = local.getFullYear();
            const month = String(local.getMonth() + 1).padStart(2, "0");
            const day = String(local.getDate()).padStart(2, "0");
            const hour = String(local.getHours()).padStart(2, "0");
            const min = String(local.getMinutes()).padStart(2, "0");
            const sec = String(local.getSeconds()).padStart(2, "0");

            return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
        }

        document.getElementById("lastUpdate").innerText =
            "آخرین آپدیت: " + formatDateTime(data.lastUpdate);

        renderSystems(systems);

    } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
        document.getElementById("lastUpdate").innerText = "خطا در ارتباط با سرور";
    }
}

loadStatus();
setInterval(loadStatus, 5000);