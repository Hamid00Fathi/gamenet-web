async function loadData() {
    const res = await fetch("https://gamenet-server.onrender.com/status/hamid01");
    const data = await res.json();

    const container = document.getElementById("systems");
    container.innerHTML = "";

    for (let key in data) {
        const sys = data[key];

        const div = document.createElement("div");
        div.className = "card " + (sys.active ? "active" : "free");

        div.innerHTML = `
            <h2>${key}</h2>
            <p>وضعیت: ${sys.active ? "فعال" : "آزاد"}</p>
            <p>زمان: ${sys.elapsed}</p>
            <p>هزینه: ${sys.cost} تومان</p>
            <p>نوت: ${sys.note}</p>
        `;

        container.appendChild(div);
    }
}

setInterval(loadData, 5000);
loadData();
