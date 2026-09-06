const username = new URLSearchParams(window.location.search).get("user");

document.getElementById("username").innerText = "کاربر: " + username;

function loadStatus() {
    fetch(`https://gamenet-server.onrender.com/status/$<username>`)
        .then(r => r.json())
        .then(data => renderSystems(data))
        .catch(err => console.log("خطا:", err));
}

function renderSystems(data) {
    const container = document.getElementById("systems");
    container.innerHTML = "";

    Object.keys(data).forEach(key => {
        const sys = data[key];

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${sys.name}</h3>
            <p>وضعیت: ${sys.active}</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه: ${sys.cost}</p>
            <p>مشتری: ${sys.customer}</p>
        `;

        container.appendChild(card);
    });

    document.getElementById("lastUpdate").innerText =
        "آخرین آپدیت: " + new Date().toLocaleTimeString();
}

loadStatus();
setInterval(loadStatus, 5000);